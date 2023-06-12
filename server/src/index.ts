// packages
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

// controllers
import { crawl, getProjects } from './controller';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/projects', getProjects);
app.post('/projects', crawl);

mongoose
  .connect('mongodb://localhost:27017/scraper')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
      console.log(`Open server on: http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.log('Could not connect to MongoDB');
  });
