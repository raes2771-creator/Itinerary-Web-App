import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { Trip, TripSummary } from './types';

const app = express();
app.use(cors());
app.use(express.json());


const DATA_DIR = path.join(process.cwd(), 'data');
const TRIPS_DIR = path.join(DATA_DIR, 'trips');
const META_FILE = path.join(DATA_DIR, 'meta.json');

//ensure directories and files exist at startup:
async function initialiseData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    await fs.mkdir(TRIPS_DIR, { recursive: true });

    try {
      await fs.access(META_FILE);
    } catch {
      // Access throws an error if the file doesn't exist
      await fs.writeFile(META_FILE, JSON.stringify([], null, 2));
      console.log('Created missing meta.json');
    }
  } catch (err) {
    console.error('Error initializing data directory:', err);
  }
}

// SERVE THE STATIC REACT APP FILES
app.use(express.static(path.join(process.cwd(), 'dist')));

// GET ALL TRIPS
app.get('/api/trips', async (req: Request, res: Response) => {
  try {
    const data: string = await fs.readFile(META_FILE, 'utf-8');
    const meta: TripSummary[] = JSON.parse(data);
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: 'Could not read meta file' });
  }
});

// GET SPECIFIC TRIP
app.get('/api/trips/:id', async (req: Request<{ id: string }>, res: Response) => {
  const id: string = req.params.id;

  if (id.includes('..')) {
    return res.status(400).send("Invalid filename");
  }

  try {
    const filePath: string = path.join(TRIPS_DIR, `${id}.json`);
    const data: string = await fs.readFile(filePath, 'utf-8');
    const trip: Trip = JSON.parse(data);
    res.json(trip);
  } catch (err) {
    res.status(404).json({ error: 'Trip not found' });
  }
});

// SAVE / UPDATE TRIP
app.post('/api/trips/:id', async (req: Request<{ id: string }, any, Trip>, res: Response) => {
  const tripData: Trip = req.body;
  const tripId: string = req.params.id;

  try {
    // Save main trip file
    const filePath: string = path.join(TRIPS_DIR, `${tripId}.json`);
    await fs.writeFile(filePath, JSON.stringify(tripData, null, 2));

    // Update meta.json
    const metaRaw: string = await fs.readFile(META_FILE, 'utf-8');
    const metaData: TripSummary[] = JSON.parse(metaRaw);

    const index: number = metaData.findIndex((t) => t.id === tripId);
    const summary: TripSummary = { id: tripId, title: tripData.title, destination: tripData.destination };

    if (index > -1) {
      metaData[index] = summary;
    } else {
      metaData.push(summary);
    }

    await fs.writeFile(META_FILE, JSON.stringify(metaData, null, 2));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save trip' });
  }
});

// RETURN index.html for any unknown routes:
app.get('*path', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

initialiseData();

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`Server running on port ${PORT}`));


