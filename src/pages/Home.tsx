import React, { useEffect } from 'react';
import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import AudioCallModal from '../components/AudioCallModal';
import MobileLayout from '../components/MobileLayout';
import { useAuth } from '../context/AuthContext';
import { useAudioCall } from '../hooks/useAudioCall';

const Home = () => {
  const { currentUser, loading } = useAuth();
  const { callStatus } = useAudioCall();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Open call modal when call status changes from idle
  useEffect(() => {
    if (callStatus !== 'idle') {
      onOpen();
    } else {
      onClose();
    }
  }, [callStatus, onOpen, onClose]);

  // Show loading state or redirect if not authenticated
  if (loading) {
    return null;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Box h="100vh" bg={bgColor}>
      <Navbar />
      
      <Box mt="64px">
        <MobileLayout 
          sidebarContent={<Sidebar />}
          mainContent={<Chat />}
        />
      </Box>
      
      <AudioCallModal isOpen={isOpen} />
    </Box>
  );
};

export default Home; 