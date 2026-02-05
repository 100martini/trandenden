require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');
const teamRoutes = require('./routes/team.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'ft_transcendence API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`
Server is running!
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
API: http://localhost:${PORT}
Auth: http://localhost:${PORT}/api/auth
      `);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });