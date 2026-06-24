import json
import boto3
import os

# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# We will pass the table name in via Terraform environment variables later
table_name = os.environ.get('TABLE_NAME', 'cloud-resume-stats')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Atomic counter update: increments the 'visitors' count by 1 safely
        response = table.update_item(
            Key={
                'id': 'visitors'
            },
            UpdateExpression='ADD visits :inc',
            ExpressionAttributeValues={
                ':inc': 1
            },
            ReturnValues='UPDATED_NEW'
        )
        
        # Extract the new count
        new_count = int(response['Attributes']['visits'])
        
        # Return a successful HTTP response with CORS headers
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*', # We will tighten this in API Gateway
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'count': new_count
            })
        }
        
    except Exception as e:
        print(f"Error updating DynamoDB: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not update visitor count'})
        }