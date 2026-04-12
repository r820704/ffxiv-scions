import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import HomePage from '@/pages/HomePage';
import WeatherPage from '@/pages/WeatherPage';
import EurekaPage from '@/pages/EurekaPage';

export default function App() {
  return (
    <HashRouter>
      <div className="max-w-[1080px] mx-auto px-4 py-4">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/eureka" element={<EurekaPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
