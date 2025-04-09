# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..services.neo4j_service import Neo4jService
from ..dependencies import get_neo4j_service

router = APIRouter()

@router.get("/stats")
async def get_general_migration_stats(
    neo4j_service: Neo4jService = Depends(get_neo4j_service)
) -> Dict[str, Any]:
    """Получение общей статистики миграции"""
    try:
        return await neo4j_service.get_migration_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flows")
async def get_migration_flows(
    neo4j_service: Neo4jService = Depends(get_neo4j_service)
) -> List[Dict[str, Any]]:
    """Получить потоки миграции между городами"""
    try:
        return await neo4j_service.get_migration_flows()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flows/{from_city}/{to_city}/details")
async def get_flow_details(
    from_city: str,
    to_city: str,
    neo4j_service: Neo4jService = Depends(get_neo4j_service)
) -> Dict[str, Any]:
    """Получить детальную информацию о миграционном потоке между двумя городами"""
    try:
        return await neo4j_service.get_flow_details(from_city, to_city)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/{city_name}")
async def get_city_migration_stats(
    city_name: str,
    neo4j_service: Neo4jService = Depends(get_neo4j_service)
) -> Dict[str, Any]:
    """Получить статистику миграции для конкретного города"""
    try:
        return await neo4j_service.get_city_migration_stats(city_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 