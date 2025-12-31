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
  try {
    const filePath: string = path.join(TRIPS_DIR, `${req.params.id}.json`);
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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));