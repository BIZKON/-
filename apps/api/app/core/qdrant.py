from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT
        )
        self.collection_name = settings.QDRANT_COLLECTION

    async def init_collection(self):
        """Initialize the knowledge base collection if it doesn't exist."""
        collections = self.client.get_collections()
        collection_names = [c.name for c in collections.collections]

        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=1536,  # OpenAI embedding size
                    distance=models.Distance.COSINE
                )
            )
            logger.info(f"Created collection: {self.collection_name}")

    def upsert_documents(
        self,
        ids: List[str],
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]]
    ):
        """Insert or update documents in the collection."""
        points = [
            models.PointStruct(
                id=id_,
                vector=vector,
                payload=payload
            )
            for id_, vector, payload in zip(ids, vectors, payloads)
        ]

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(
        self,
        query_vector: List[float],
        filter_conditions: Optional[Dict[str, Any]] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        search_filter = None
        if filter_conditions:
            must_conditions = []
            for key, value in filter_conditions.items():
                must_conditions.append(
                    models.FieldCondition(
                        key=key,
                        match=models.MatchValue(value=value)
                    )
                )
            search_filter = models.Filter(must=must_conditions)

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=search_filter,
            limit=limit
        )

        return [
            {
                "id": str(hit.id),
                "score": hit.score,
                "payload": hit.payload
            }
            for hit in results
        ]

    def delete_by_document_id(self, document_id: str):
        """Delete all points associated with a document."""
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id)
                        )
                    ]
                )
            )
        )


qdrant_service = QdrantService()
