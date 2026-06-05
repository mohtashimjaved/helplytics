import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './routes/index.js';
import mongoose from './db/index.js';
import helmet from "helmet"

dotenv.config();

const app = express();
const port = process.env.PORT

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Dynamically switches based on environment
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(helmet())
app.use(cors(corsOptions));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Router
app.use('/api', mainRouter);

// DB Connection
mongoose.connection.on('open', () => {
  console.log('DB Connected');
});

mongoose.connection.on('error', (err) => {
  console.log('DB error:', err);
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
