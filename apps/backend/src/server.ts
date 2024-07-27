import express from 'express';
import cors from 'cors';
import multer from 'multer';
import csvToJson from 'convert-csv-to-json';
import path from 'path';

const app = express();
const port = process.env.PORT ?? 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage });

let userData: Array<Record<string, string>> = [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../', 'frontend/dist')));

app.get('/api/users', (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).send({ message: 'Query "q" es requerido' });
  }

  const search = q.toString().toLowerCase();

  const filteredData = userData.filter((row) => {
    return Object.values(row).some((value) =>
      value.toLowerCase().includes(search)
    );
  });

  return res.status(200).send({ data: filteredData });
});

app.post('/api/files', upload.single('file'), (req, res) => {
  const { file } = req;
  if (!file)
    return res.status(400).send({ message: 'No se ha cargado ningún archivo' });
  if (file.mimetype !== 'text/csv')
    return res.status(400).send({ message: 'El archivo debe ser CSV' });

  let json: Array<Record<string, string>> = [];
  try {
    const data = file.buffer.toString();
    json = csvToJson.fieldDelimiter(',').csvStringToJson(data);
  } catch (error) {
    return res.status(500).send({ message: 'Error al leer el archivo CSV' });
  }

  userData = json;

  res
    .status(200)
    .send({ data: json, message: 'Archivo cargado correctamente' });
});

app.listen(port, () => {
  console.log(`Server ON en http://localhost:${port}`);
});
