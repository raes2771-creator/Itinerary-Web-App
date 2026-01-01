import { Routes, Route, useParams } from 'react-router-dom';
import FrontPage from './frontPage'; // Rename or adjust import
import TripView from './tripView'; // Assume TripView exists

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/trip/:id" element={<TripView tripId={useParams().id!} />} />
    </Routes>
  );
}