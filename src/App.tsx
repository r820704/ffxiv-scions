import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import HomePage from '@/pages/HomePage';
import EurekaWeatherPage from '@/pages/EurekaWeatherPage';
import EurekaPage from '@/pages/EurekaPage';
import EurekaGearPage from '@/pages/EurekaGearPage';

export default function App() {
  return (
    <HashRouter>
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/eureka-weather" element={<EurekaWeatherPage />} />
          <Route path="/eureka" element={<EurekaPage />} />
          <Route path="/eureka-gear" element={<EurekaGearPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
