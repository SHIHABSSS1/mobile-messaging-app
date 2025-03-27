import React, { useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  VStack,
  Text,
  Avatar,
  Box,
  Flex,
  IconButton,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { FiPhoneOff, FiPhoneIncoming, FiPhoneOutgoing, FiMic, FiMicOff } from 'react-icons/fi';
import { useAudioCall } from '../hooks/useAudioCall';
import { useAuth } from '../context/AuthContext';

interface AudioCallModalProps {
  isOpen: boolean;
}

const AudioCallModal: React.FC<AudioCallModalProps> = ({ isOpen }) => {
  const [isMuted, setIsMuted] = React.useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { 
    callStatus, 
    callError, 
    remoteUser, 
    localStreamRef,
    remoteStreamRef,
    answerCall, 
    rejectCall, 
    endCall 
  } = useAudioCall();
  
  const { currentUser } = useAuth();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Play remote audio stream when available
  useEffect(() => {
    if (callStatus === 'ongoing' && remoteStreamRef.current && audioRef.current) {
      audioRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callStatus, remoteStreamRef.current]);

  // Toggle microphone mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setIsMuted(!enabled);
      }
    }
  };

  // Handle end call
  const handleEndCall = () => {
    if (callStatus === 'ongoing' || callStatus === 'calling') {
      endCall();
    } else if (callStatus === 'receiving') {
      rejectCall();
    }
  };

  // Handle answer call
  const handleAnswerCall = () => {
    if (callStatus === 'receiving') {
      answerCall();
    }
  };

  // Render different UI based on call status
  const renderCallContent = () => {
    switch (callStatus) {
      case 'calling':
        return (
          <VStack spacing={4}>
            <Avatar 
              size="xl" 
              name={remoteUser?.displayName} 
              src={remoteUser?.photoURL} 
            />
            <Text fontSize="xl" fontWeight="bold">
              {remoteUser?.displayName}
            </Text>
            <Text>Calling...</Text>
            <Spinner size="lg" color="teal.500" />
          </VStack>
        );
      
      case 'receiving':
        return (
          <VStack spacing={4}>
            <Avatar 
              size="xl" 
              name={remoteUser?.displayName} 
              src={remoteUser?.photoURL} 
            />
            <Text fontSize="xl" fontWeight="bold">
              {remoteUser?.displayName}
            </Text>
            <Text>Incoming call...</Text>
            <HStack spacing={4}>
              <IconButton
                aria-label="Reject call"
                icon={<FiPhoneOff />}
                colorScheme="red"
                rounded="full"
                size="lg"
                onClick={handleEndCall}
              />
              <IconButton
                aria-label="Answer call"
                icon={<FiPhoneIncoming />}
                colorScheme="green"
                rounded="full"
                size="lg"
                onClick={handleAnswerCall}
              />
            </HStack>
          </VStack>
        );
      
      case 'ongoing':
        return (
          <VStack spacing={4}>
            <Avatar 
              size="xl" 
              name={remoteUser?.displayName} 
              src={remoteUser?.photoURL} 
            />
            <Text fontSize="xl" fontWeight="bold">
              {remoteUser?.displayName}
            </Text>
            <Text>Call in progress</Text>
            <Box>
              <audio ref={audioRef} autoPlay />
            </Box>
            <HStack spacing={4}>
              <IconButton
                aria-label="Toggle mute"
                icon={isMuted ? <FiMicOff /> : <FiMic />}
                colorScheme={isMuted ? "gray" : "teal"}
                rounded="full"
                onClick={toggleMute}
              />
              <IconButton
                aria-label="End call"
                icon={<FiPhoneOff />}
                colorScheme="red"
                rounded="full"
                size="lg"
                onClick={handleEndCall}
              />
            </HStack>
          </VStack>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen || callStatus === 'idle') return null;

  return (
    <Modal isOpen={isOpen} onClose={handleEndCall} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">
          {callStatus === 'calling' && 'Outgoing Call'}
          {callStatus === 'receiving' && 'Incoming Call'}
          {callStatus === 'ongoing' && 'Call in Progress'}
        </ModalHeader>
        <ModalBody py={8}>
          <Flex justify="center" align="center">
            {renderCallContent()}
          </Flex>
          {callError && (
            <Text color="red.500" textAlign="center" mt={4}>
              {callError}
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AudioCallModal; 