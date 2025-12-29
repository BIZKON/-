from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET

    def init_bucket(self):
        """Initialize the storage bucket if it doesn't exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error initializing bucket: {e}")
            raise

    def upload_file(
        self,
        file_data: bytes,
        object_name: str,
        content_type: str = "application/octet-stream"
    ) -> str:
        """Upload a file to storage."""
        try:
            self.client.put_object(
                self.bucket_name,
                object_name,
                io.BytesIO(file_data),
                length=len(file_data),
                content_type=content_type
            )
            return f"{self.bucket_name}/{object_name}"
        except S3Error as e:
            logger.error(f"Error uploading file: {e}")
            raise

    def get_file(self, object_name: str) -> Optional[bytes]:
        """Download a file from storage."""
        try:
            response = self.client.get_object(self.bucket_name, object_name)
            return response.read()
        except S3Error as e:
            logger.error(f"Error downloading file: {e}")
            return None
        finally:
            if 'response' in locals():
                response.close()
                response.release_conn()

    def delete_file(self, object_name: str) -> bool:
        """Delete a file from storage."""
        try:
            self.client.remove_object(self.bucket_name, object_name)
            return True
        except S3Error as e:
            logger.error(f"Error deleting file: {e}")
            return False

    def get_presigned_url(self, object_name: str, expires: int = 3600) -> str:
        """Get a presigned URL for temporary file access."""
        from datetime import timedelta
        try:
            return self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=timedelta(seconds=expires)
            )
        except S3Error as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise


storage_service = StorageService()
