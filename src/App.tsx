import { Routes, Route } from 'react-router-dom';
import FrontPage from './frontPage'; 
import TripView from './tripView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/trip/:id" element={<TripView />} />
    </Routes>
  );
}