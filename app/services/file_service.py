"""
PlacementOps AI — File Service
S3-compatible file upload/download for JD files and resumes.
"""

import boto3
from botocore.exceptions import ClientError
from app.config import settings
import uuid
from typing import Optional

s3_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT_URL,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    region_name=settings.S3_REGION
)

def ensure_bucket_exists():
    try:
        s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)
        else:
            print(f"S3 Error: {e}")

async def upload_file(file_content: bytes, filename: str, content_type: str = "application/pdf") -> Optional[str]:
    """Uploads a file to S3 and returns the URL."""
    # Note: In a real async app, use aioboto3. 
    # For hackathon simplicity, wrapping boto3 is acceptable or assuming small files.
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    try:
        ensure_bucket_exists()
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=unique_filename,
            Body=file_content,
            ContentType=content_type
        )
        # Generate URL
        url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{unique_filename}"
        return url
    except Exception as e:
        print(f"Failed to upload file: {e}")
        return None
