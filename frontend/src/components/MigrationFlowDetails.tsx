import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Box
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface MigrationPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  reason: string;
  date: string;
  has_children: boolean;
  transport_type: string;
  monthly_income: number;
  housing_type: string;
}

interface FlowDetails {
  fromCity: string;
  toCity: string;
  totalCount: number;
  averageAge: number;
  genderDistribution: { gender: string; count: number }[];
  reasonDistribution: { reason: string; count: number }[];
  transportDistribution: { transport: string; count: number }[];
  housingDistribution: { housing: string; count: number }[];
  incomeDistribution: { range: string; count: number }[];
  people: MigrationPerson[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MigrationFlowDetails: React.FC = () => {
  const { fromCity, toCity } = useParams<{ fromCity: string; toCity: string }>();
  const [loading, setLoading] = useState(true);
  const [flowDetails, setFlowDetails] = useState<FlowDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowDetails = async () => {
      try {
        const encodedFromCity = encodeURIComponent(fromCity || '');
        const encodedToCity = encodeURIComponent(toCity || '');
        const response = await fetch(`/api/v1/migration/flows/${encodedFromCity}/${encodedToCity}/details`);
        if (!response.ok) {
          throw new Error('Failed to fetch flow details');
        }
        const data = await response.json();
        setFlowDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlowDetails();
  }, [fromCity, toCity]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !flowDetails) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {error || 'Failed to load flow details'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Міграційний потік: {flowDetails.fromCity} → {flowDetails.toCity}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Загальна інформація</Typography>
            <Typography>Загальна кількість мігрантів: {flowDetails.totalCount}</Typography>
            <Typography>Середній вік: {flowDetails.averageAge.toFixed(1)}</Typography>
          </Paper>
        </Grid>

        {/* Графики распределения */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Розподіл за статтю</Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={flowDetails.genderDistribution}
                dataKey="count"
                nameKey="gender"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {flowDetails.genderDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Розподіл за причинами</Typography>
            <BarChart width={400} height={300} data={flowDetails.reasonDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reason" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Розподіл за транспортом</Typography>
            <BarChart width={400} height={300} data={flowDetails.transportDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="transport" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Розподіл за типом житла</Typography>
            <BarChart width={400} height={300} data={flowDetails.housingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="housing" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </Paper>
        </Grid>

        {/* Таблица с данными о людях */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Детальна інформація про мігрантів</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Ім'я</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Вік</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Стать</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Причина</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Дата</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Транспорт</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Дохід</th>
                  </tr>
                </thead>
                <tbody>
                  {flowDetails.people.map((person) => (
                    <tr key={person.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.name}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.age}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.gender}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.reason}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.date}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.transport_type}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{person.monthly_income}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MigrationFlowDetails; 