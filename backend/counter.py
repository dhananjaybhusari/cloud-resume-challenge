import json
import boto3
import os
import urllib.request
import urllib.parse

# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb')

table_name = os.environ.get('TABLE_NAME', 'cloud-resume-stats')
table = dynamodb.Table(table_name)

# Telegram credentials stored safely in Lambda Environment Variables
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

def send_telegram_alert(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML"
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception as err:
        print(f"Telegram alert error: {err}")

def lambda_handler(event, context):
    try:
        # 1. Atomic counter update: increments the 'visitors' count by 1 safely
        response = table.update_item(
            Key={'id': 'visitors'},
            UpdateExpression='ADD visits :inc',
            ExpressionAttributeValues={':inc': 1},
            ReturnValues='UPDATED_NEW'
        )
        new_count = int(response['Attributes']['visits'])

        # 2. Extract visitor telemetry from frontend body & AWS CloudFront headers
        body_data = {}
        if event.get('body'):
            try:
                body_data = json.loads(event['body'])
            except Exception:
                pass

        headers = event.get('headers', {})

        # CloudFront Edge Geolocation headers (auto-populated by AWS)
        country = headers.get('cloudfront-viewer-country') or headers.get('CloudFront-Viewer-Country') or 'Unknown'
        city = headers.get('cloudfront-viewer-city') or headers.get('CloudFront-Viewer-City') or 'Unknown'

        # Client IP
        source_ip = (
            headers.get('x-forwarded-for', '').split(',')[0].strip() or 
            event.get('requestContext', {}).get('http', {}).get('sourceIp') or 
            event.get('requestContext', {}).get('identity', {}).get('sourceIp') or 
            'Unknown'
        )

        # Referrer / Source
        raw_referrer = body_data.get('ref') or headers.get('referer') or 'Direct'
        src_tag = body_data.get('src') or ''
        screen = body_data.get('screen') or 'Unknown'
        user_agent = headers.get('user-agent', 'Unknown')

        # Clean referrer name
        source_label = raw_referrer
        if src_tag:
            source_label = f"Campaign ({src_tag})"
        elif 'linkedin' in raw_referrer.lower():
            source_label = "LinkedIn"
        elif 'github' in raw_referrer.lower():
            source_label = "GitHub"
        elif 'google' in raw_referrer.lower():
            source_label = "Google Search"
        elif 'twitter' in raw_referrer.lower() or 'x.com' in raw_referrer.lower():
            source_label = "X (Twitter)"
        elif raw_referrer == 'Direct' or not raw_referrer:
            source_label = "Direct / Bookmark"

        # 3. Format Telegram Message
        msg = (
            f"🚀 <b>New Portfolio Visitor #{new_count}!</b>\n\n"
            f"🔗 <b>Source:</b> {source_label}\n"
            f"📍 <b>Location:</b> {city}, {country}\n"
            f"🌐 <b>IP:</b> <code>{source_ip}</code>\n"
            f"📱 <b>Screen:</b> {screen}\n"
            f"💻 <b>Client:</b> {user_agent[:90]}..."
        )

        send_telegram_alert(msg)

        # 4. Return HTTP 200 with CORS headers
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'count': new_count})
        }

    except Exception as e:
        print(f"Error updating DynamoDB: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not update visitor count'})
        }
