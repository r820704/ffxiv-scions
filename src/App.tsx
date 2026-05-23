import { HashRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import NavBar from '@/components/NavBar';
import SiteFooter from '@/components/SiteFooter';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import EurekaWeatherPage from '@/pages/EurekaWeatherPage';
import EurekaPage from '@/pages/EurekaPage';
import EurekaGearPage from '@/pages/EurekaGearPage';
import EurekaNmPage from '@/pages/EurekaNmPage';
import AboutPage from '@/pages/AboutPage';

function Contained({ children }: { children: ReactNode }) {
  return <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">{children}</div>;
}

export default function App() {
  return (
    <HashRouter>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-background focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        跳至主要內容
      </a>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main id="main" className="flex-1">
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
            <Route
              path="/eureka-nm"
              element={
                <Contained>
                  <EurekaNmPage />
                </Contained>
              }
            />
            <Route
              path="/about"
              element={
                <Contained>
                  <AboutPage />
                </Contained>
              }
            />
          </Routes>
        </main>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full">
          <SiteFooter />
        </div>
      </div>
      <Toaster position="bottom-center" />
    </HashRouter>
  );
}
