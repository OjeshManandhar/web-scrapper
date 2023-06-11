// packages
import express from 'express';

// controllers
import { crawl } from './controller';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/', crawl);

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
  console.log(`Open server on: http://localhost:${PORT}`);
});
