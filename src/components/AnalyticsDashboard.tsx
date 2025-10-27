import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample analytics data - replace with real data from your backend
const monthlyUsage = [
  { month: 'Jan', users: 4000, books: 2400, amt: 2400 },
  { month: 'Feb', users: 3000, books: 1398, amt: 2210 },
  { month: 'Mar', users: 2000, books: 9800, amt: 2290 },
  { month: 'Apr', users: 2780, books: 3908, amt: 2000 },
  { month: 'May', users: 1890, books: 4800, amt: 2181 },
  { month: 'Jun', users: 2390, books: 3800, amt: 2500 },
];

const bookUsageData = [
  { name: 'Grade 9', value: 400 },
  { name: 'Grade 10', value: 300 },
  { name: 'Grade 11', value: 300 },
  { name: 'Grade 12', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('month');

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        {[
          { title: 'Total Active Users', value: '12,345', change: '+12%' },
          { title: 'Books Read', value: '45,678', change: '+8%' },
          { title: 'Average Reading Time', value: '32 mins', change: '+5%' },
          { title: 'Total Sessions', value: '89,012', change: '+15%' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography
                color={stat.change.startsWith('+') ? 'success.main' : 'error.main'}
                variant="body2"
              >
                {stat.change} vs last period
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <LineChart
              width={800}
              height={300}
              data={monthlyUsage}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="books" stroke="#82ca9d" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Book Usage by Grade */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Book Usage by Grade
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={bookUsageData}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {bookUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        {/* Reading Time Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reading Time Distribution
            </Typography>
            <BarChart width={1100} height={300} data={monthlyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" />
              <Bar dataKey="books" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
