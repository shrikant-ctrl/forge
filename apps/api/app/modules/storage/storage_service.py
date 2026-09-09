import boto3
from botocore.config import Config

from app.core.config import settings


class StorageService:
    """Injectable S3 / MinIO storage provider for presigned URL generation and blob management."""

    def __init__(self):
        self.bucket = settings.S3_BUCKET_NAME
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            config=Config(signature_version="s3v4"),
        )

    def generate_presigned_upload_url(
        self,
        storage_key: str,
        mime_type: str,
        expires_in: int = 3600,
    ) -> str:
        """Generate a short-lived presigned URL for direct client PUT upload."""
        return self.client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket,
                "Key": storage_key,
                "ContentType": mime_type,
            },
            ExpiresIn=expires_in,
        )

    def generate_presigned_download_url(
        self,
        storage_key: str,
        filename: str,
        expires_in: int = 3600,
    ) -> str:
        """Generate a short-lived presigned URL for secure direct client GET download."""
        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": storage_key,
                "ResponseContentDisposition": f'attachment; filename="{filename}"',
            },
            ExpiresIn=expires_in,
        )

    def delete_object(self, storage_key: str) -> None:
        """Delete an object directly from storage."""
        self.client.delete_object(Bucket=self.bucket, Key=storage_key)


_storage_service_instance = StorageService()


def get_storage_service() -> StorageService:
    """FastAPI provider/dependency for injecting the StorageService."""
    return _storage_service_instance
