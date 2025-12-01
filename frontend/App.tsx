import React, { Suspense, lazy } from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './src/contexts/LanguageContext';

const Home = lazy(() => import('./src/pages/Home'));
const Reader = lazy(() => import('./src/pages/Reader'));
const Audio = lazy(() => import('./src/pages/Audio'));
const Search = lazy(() => import('./src/pages/Search'));
const Strongs = lazy(() => import('./src/pages/Strongs'));
const Plans = lazy(() => import('./src/pages/Plans'));
const NotFound = lazy(() => import('./src/pages/NotFound'));

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Theme appearance="inherit" radius="large" scaling="100%">
        <Router>
          <Suspense fallback={<div style={{ padding: 24 }}>Chargement...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reader" element={<Reader />} />
              <Route path="/audio" element={<Audio />} />
              <Route path="/search" element={<Search />} />
              <Route path="/strongs" element={<Strongs />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </Router>
      </Theme>
    </LanguageProvider>
  );
}

export default App;
