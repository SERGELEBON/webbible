import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './src/contexts/LanguageContext';

import Home from './src/pages/Home';
import Reader from './src/pages/Reader';
import Audio from './src/pages/Audio';
import Search from './src/pages/Search';
import Strongs from './src/pages/Strongs';
import Plans from './src/pages/Plans';
import NotFound from './src/pages/NotFound';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Theme appearance="inherit" radius="large" scaling="100%">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reader" element={<Reader />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/search" element={<Search />} />
            <Route path="/strongs" element={<Strongs />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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