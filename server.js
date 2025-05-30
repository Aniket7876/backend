const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerDocs = require('./config/swagger/swagger');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(helmet());

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));

swaggerDocs(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));