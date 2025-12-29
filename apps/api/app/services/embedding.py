from langchain_openai import OpenAIEmbeddings
from app.core.config import settings
from typing import List
import logging

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small"
        )

    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        try:
            result = await self.embeddings.aembed_query(text)
            return result
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        try:
            results = await self.embeddings.aembed_documents(texts)
            return results
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise


embedding_service = EmbeddingService()
