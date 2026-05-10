import { HashRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import NavBar from '@/components/NavBar';
import SiteFooter from '@/components/SiteFooter';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import EurekaWeatherPage from '@/pages/EurekaWeatherPage';
import EurekaPage from '@/pages/EurekaPage';
import EurekaGearPage from '@/pages/EurekaGearPage';

function Contained({ children }: { children: ReactNode }) {
  return <div className="max-w-[1280px] mx-auto px-4 py-4">{children}</div>;
}

export default function App() {
  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/eureka-weather"
          element={
            <Contained>
              <EurekaWeatherPage />
            </Contained>
          }
        />
        <Route
          path="/eureka"
          element={
            <Contained>
              <EurekaPage />
            </Contained>
          }
        />
        <Route
          path="/eureka-gear"
          element={
            <Contained>
              <EurekaGearPage />
            </Contained>
          }
        />
      </Routes>
      <Contained>
        <SiteFooter />
      </Contained>
      <Toaster position="bottom-center" />
    </HashRouter>
  );
}
