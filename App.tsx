import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';

const App = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App; 