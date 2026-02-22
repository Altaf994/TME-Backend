const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON
app.use(express.json());
const cors = require('cors');

// Configure CORS to allow local frontend and credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like server-to-server or curl)
    if (!origin) return callback(null, true);
    const allowed = ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001'];
    if (allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));
// Handle preflight for all routes
app.options('*', cors(corsOptions));

// Mount API router
const apiRouter = require('./src/routes');
console.log('DEBUG: Mounting /api router');
app.use('/api', apiRouter);

// Error handler (must come after routes)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello from Backend');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
