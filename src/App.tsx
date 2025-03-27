import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// Try different import paths for AuthContext and ChatContext
let AuthProvider, ChatProvider, Home, Login, Signup;

try {
  AuthProvider = require('./context/AuthContext').AuthProvider;
  ChatProvider = require('./context/ChatContext').ChatProvider;
  Home = require('./pages/Home').default;
  Login = require('./pages/Login').default;
  Signup = require('./pages/Signup').default;
} catch (e) {
  console.error("Error loading components with relative paths:", e);
  try {
    // Try with absolute paths
    AuthProvider = require('/opt/render/project/src/src/context/AuthContext').AuthProvider;
    ChatProvider = require('/opt/render/project/src/src/context/ChatContext').ChatProvider;
    Home = require('/opt/render/project/src/src/pages/Home').default;
    Login = require('/opt/render/project/src/src/pages/Login').default;
    Signup = require('/opt/render/project/src/src/pages/Signup').default;
  } catch (e2) {
    console.error("Failed to load components with absolute paths:", e2);
    // Provide fallback components
    const FallbackComponent = () => <div>Failed to load component. Check console for details.</div>;
    AuthProvider = ({ children }) => <>{children}</>;
    ChatProvider = ({ children }) => <>{children}</>;
    Home = FallbackComponent;
    Login = FallbackComponent;
    Signup = FallbackComponent;
  }
}

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