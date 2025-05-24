import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ImageSearch from './pages/ImageSearch';
import Cart from './pages/Cart';
import AIAssistant from './components/AIAssistant';
import Products from './pages/Products';

const App: React.FC = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box as="main" p={4}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<ImageSearch />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App; 