import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Исправление проблемы с иконками маркеров в Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface City {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
}

interface MigrationFlow {
  fromCity: string;
  toCity: string;
  count: number;
  avg_age: number;
  reasons: string[];
  distance: number;
}

interface MigrationMapProps {}

const MigrationMap: React.FC<MigrationMapProps> = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<'cities' | 'flows'>('cities');
  const [migrationFlows, setMigrationFlows] = useState<MigrationFlow[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const navigate = useNavigate();

  // Загрузка городов
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/v1/cities');
        if (!response.ok) {
          throw new Error('Помилка завантаження міст');
        }
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Помилка:', error);
      }
    };

    fetchCities();
  }, []);

  // Загрузка потоков миграции
  useEffect(() => {
    const fetchMigrationFlows = async () => {
      try {
        const response = await fetch('/api/v1/migration/flows');
        if (!response.ok) {
          throw new Error('Помилка завантаження потоків міграції');
        }
        const data = await response.json();
        setMigrationFlows(data);
      } catch (error) {
        console.error('Помилка:', error);
      }
    };

    fetchMigrationFlows();
  }, []);

  // Центр карты - Украина
  const center: [number, number] = [48.3794, 31.1656];

  // Обработчик изменения типа визуализации
  const handleVisualizationChange = (
    event: React.MouseEvent<HTMLElement>,
    newVisualization: 'cities' | 'flows' | null,
  ) => {
    if (newVisualization !== null) {
      setVisualizationType(newVisualization);
    }
  };

  // Получение цвета маркера в зависимости от населения
  const getMarkerColor = (population: number): string => {
    if (population > 1000000) return '#ff0000'; // Красный для больших городов
    if (population > 500000) return '#ff7f00'; // Оранжевый для средних городов
    if (population > 100000) return '#ffff00'; // Желтый для малых городов
    return '#00ff00'; // Зеленый для очень малых городов
  };

  // Получение размера маркера в зависимости от населения
  const getMarkerSize = (population: number): number => {
    return Math.log10(population) * 5;
  };

  // Получение цвета линии в зависимости от количества мигрантов
  const getFlowColor = (count: number): string => {
    if (count > 1000) return '#ff0000';
    if (count > 500) return '#ff7f00';
    if (count > 100) return '#ffff00';
    return '#00ff00';
  };

  // Получение толщины линии в зависимости от количества мигрантов
  const getFlowWeight = (count: number): number => {
    return Math.log10(count) * 2;
  };

  // Получение координат города по его имени
  const getCityCoordinates = (cityName: string): [number, number] | null => {
    const city = cities.find(c => c.name === cityName);
    return city ? [city.latitude, city.longitude] : null;
  };

  const handleFlowClick = (fromCity: string, toCity: string) => {
    const encodedFromCity = encodeURIComponent(fromCity);
    const encodedToCity = encodeURIComponent(toCity);
    navigate(`/flow/${encodedFromCity}/${encodedToCity}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Карта міграції
        </Typography>
        <ToggleButtonGroup
          value={visualizationType}
          exclusive
          onChange={handleVisualizationChange}
          aria-label="тип візуалізації"
        >
          <ToggleButton value="cities" aria-label="міста">
            Міста
          </ToggleButton>
          <ToggleButton value="flows" aria-label="потоки">
            Потоки
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Paper sx={{ height: '600px', overflow: 'hidden' }}>
        <MapContainer 
          center={center} 
          zoom={6} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {cities.map((city) => (
            <Marker
              key={city.name}
              position={[city.latitude, city.longitude]}
              eventHandlers={{
                click: () => setSelectedCity(city.name),
              }}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                  background-color: ${getMarkerColor(city.population)};
                  width: ${getMarkerSize(city.population)}px;
                  height: ${getMarkerSize(city.population)}px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                "></div>`,
                iconSize: [getMarkerSize(city.population), getMarkerSize(city.population)],
                iconAnchor: [getMarkerSize(city.population) / 2, getMarkerSize(city.population) / 2],
              })}
            >
              <Popup>
                <Typography variant="h6">{city.name}</Typography>
                <Typography>Регіон: {city.region}</Typography>
                <Typography>Населення: {city.population.toLocaleString()}</Typography>
              </Popup>
            </Marker>
          ))}
          
          {visualizationType === 'flows' && migrationFlows.map((flow, index) => {
            const fromCoords = getCityCoordinates(flow.fromCity);
            const toCoords = getCityCoordinates(flow.toCity);
            
            if (!fromCoords || !toCoords) return null;
            
            return (
              <Polyline
                key={`${flow.fromCity}-${flow.toCity}-${index}`}
                positions={[fromCoords, toCoords]}
                pathOptions={{
                  color: getFlowColor(flow.count),
                  weight: getFlowWeight(flow.count),
                  opacity: 0.6
                }}
                eventHandlers={{
                  click: () => handleFlowClick(flow.fromCity, flow.toCity)
                }}
              >
                <LeafletTooltip>
                  <div>
                    <Typography variant="subtitle2">Міграційний потік</Typography>
                    <Typography>З: {flow.fromCity}</Typography>
                    <Typography>До: {flow.toCity}</Typography>
                    <Typography>Кількість: {flow.count}</Typography>
                    <Typography>Середній вік: {flow.avg_age ? flow.avg_age.toFixed(1) : 'Н/Д'}</Typography>
                    <Typography>Середня відстань: {flow.distance.toFixed(1)} км</Typography>
                    <Typography>Причини: {flow.reasons ? flow.reasons.join(', ') : 'Н/Д'}</Typography>
                  </div>
                </LeafletTooltip>
              </Polyline>
            );
          })}
        </MapContainer>
      </Paper>
    </Box>
  );
};

export default MigrationMap; 