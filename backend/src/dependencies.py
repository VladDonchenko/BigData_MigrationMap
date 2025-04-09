from functools import lru_cache
from .services.neo4j_service import Neo4jService

@lru_cache()
def get_neo4j_service() -> Neo4jService:
    """
    Створює та кешує екземпляр Neo4jService
    """
    return Neo4jService() 