# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from src.services.neo4j_service import Neo4jService

router = APIRouter()
neo4j_service = Neo4jService()

@router.get("/")
async def get_cities():
    """
    Получить список всех городов
    """
    return await neo4j_service.get_cities()

@router.get("/{city_name}")
async def get_city(city_name: str):
    """
    Получить информацию о конкретном городе
    """
    return await neo4j_service.get_city(city_name)

@router.get("/{city_name}/stats")
async def get_city_stats(city_name: str) -> Dict[str, Any]:
    """
    Получение статистики по городу
    """
    try:
        # TODO: Реализовать получение статистики из Neo4j
        return {
            "city": city_name,
            "incoming_migrations": 0,
            "outgoing_migrations": 0,
            "avg_distance": 0,
            "reasons": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 