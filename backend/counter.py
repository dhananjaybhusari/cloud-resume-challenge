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

def get_detailed_geo(ip):
    """Fetches high-precision IP geolocation: City, Region, Zip, Lat/Lon, ISP, Org"""
    if not ip or ip == 'Unknown' or ip.startswith(('127.', '10.', '192.168.')):
        return {}
    try:
        url = f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query"
        req = urllib.request.Request(url, headers={'User-Agent': 'PortfolioBot/1.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('status') == 'success':
                return data
    except Exception as err:
        print(f"Geo lookup error: {err}")
    return {}

def send_telegram_alert(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
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

        # 2. Extract visitor telemetry from frontend body & headers
        body_data = {}
        if event.get('body'):
            try:
                body_data = json.loads(event['body'])
            except Exception:
                pass

        headers = event.get('headers', {})

        # Client IP
        source_ip = (
            headers.get('x-forwarded-for', '').split(',')[0].strip() or 
            event.get('requestContext', {}).get('http', {}).get('sourceIp') or 
            event.get('requestContext', {}).get('identity', {}).get('sourceIp') or 
            'Unknown'
        )

        # 3. High-Precision IP Geolocation Lookup
        geo = get_detailed_geo(source_ip)
        city = geo.get('city') or 'Unknown'
        region = geo.get('regionName') or ''
        country = geo.get('country') or 'Unknown'
        postal_code = geo.get('zip') or ''
        lat = geo.get('lat')
        lon = geo.get('lon')
        timezone = geo.get('timezone') or ''
        isp = geo.get('isp') or ''
        org = geo.get('org') or ''

        # Location string formatting: City, State (Postal Code), Country
        loc_parts = [city]
        if region and region != city:
            loc_parts.append(region)
        if postal_code:
            loc_parts.append(f"({postal_code})")
        if country and country != 'Unknown':
            loc_parts.append(country)
        location_str = ", ".join(loc_parts)

        # Maps link
        maps_str = ""
        if lat is not None and lon is not None:
            maps_url = f"https://www.google.com/maps?q={lat},{lon}"
            maps_str = f"📍 <b>Coordinates:</b> <code>{lat}, {lon}</code> (<a href=\"{maps_url}\">Open in Google Maps</a>)\n"

        # Network / Organization
        network_str = org or isp or "Standard ISP"

        # Referrer / Campaign Tag
        raw_referrer = body_data.get('ref') or headers.get('referer') or 'Direct'
        src_tag = body_data.get('src') or ''
        screen = body_data.get('screen') or 'Unknown'
        user_agent = headers.get('user-agent', 'Unknown')

        # Clean source label
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
        else:
            source_label = raw_referrer[:40]

        # 4. Format Detailed High-Precision Telegram Message
        msg = (
            f"🚀 <b>New Portfolio Visitor #{new_count}!</b>\n\n"
            f"🔗 <b>Source:</b> {source_label}\n"
            f"🏙️ <b>Location:</b> {location_str}\n"
            f"{maps_str}"
            f"🏢 <b>ISP / Org:</b> {network_str}\n"
            f"🌐 <b>IP:</b> <code>{source_ip}</code>\n"
            f"⏰ <b>Timezone:</b> {timezone}\n"
            f"📱 <b>Screen:</b> {screen}\n"
            f"💻 <b>Client:</b> {user_agent[:85]}..."
        )

        send_telegram_alert(msg)

        # 5. Return HTTP 200 with CORS headers
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
