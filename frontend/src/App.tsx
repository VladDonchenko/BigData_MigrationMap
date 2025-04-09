import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import MigrationMap from './components/MigrationMap';
import MigrationFlowDetails from './components/MigrationFlowDetails';

interface City {
  id: number;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
}

interface MigrationStats {
  totalMigrations: number;
  averageAge: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  topReasons: string[];
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [stats, setStats] = useState<MigrationStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesResponse, statsResponse] = await Promise.all([
          fetch('/api/v1/cities'),
          fetch('/api/v1/migration/stats')
        ]);

        if (!citiesResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const citiesData = await citiesResponse.json();
        const statsData = await statsResponse.json();

        setCities(citiesData);
        setStats(statsData);
      } catch (error) {
        console.error('Помилка:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={<MigrationMap />} />
            <Route path="/flow/:fromCity/:toCity" element={<MigrationFlowDetails />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App; 