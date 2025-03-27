import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Avatar,
  HStack,
  VStack,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Spinner
} from '@chakra-ui/react';
import { FiSend, FiImage, FiMoreVertical, FiPhone, FiTrash2 } from 'react-icons/fi';
import { useChat, Message } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChat';
import { useAudioCall } from '../hooks/useAudioCall';
import moment from 'moment';

const Chat = () => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { data } = useChat();
  const { currentUser } = useAuth();
  const { sendMessage, unsendMessage } = useChats();
  const { startCall, callStatus } = useAudioCall();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const messageBg = useColorModeValue('teal.100', 'teal.700');
  const myMessageBg = useColorModeValue('blue.100', 'blue.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data.messages]);

  const handleSend = async () => {
    if ((text.trim() === '' && !selectedImage) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await sendMessage(text, selectedImage);
      setText('');
      setSelectedImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          onOpen();
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const cancelImageUpload = () => {
    setSelectedImage(null);
    setUploadedImage(null);
    onClose();
  };

  const confirmImageUpload = () => {
    onClose();
    if (selectedImage) {
      handleSend();
    }
  };

  const handleInitiateCall = () => {
    if (data.user && callStatus === 'idle') {
      startCall(data.user);
    }
  };

  // Filter out unsent messages
  const displayMessages = data.messages.filter(msg => !msg.unsent);

  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      bg={bgColor}
    >
      {/* Chat Header */}
      {data.user ? (
        <>
          <HStack
            p={4}
            bg={headerBg}
            borderBottom="1px"
            borderColor={borderColor}
            spacing={4}
          >
            <Avatar 
              size="sm" 
              name={data.user.displayName} 
              src={data.user.photoURL} 
            />
            <Box flex="1">
              <Text fontWeight="bold">{data.user.displayName}</Text>
            </Box>
            <IconButton
              aria-label="Audio call"
              icon={<FiPhone />}
              onClick={handleInitiateCall}
              isDisabled={callStatus !== 'idle'}
              variant="ghost"
            />
          </HStack>

          {/* Messages */}
          <Box
            flex="1"
            overflowY="auto"
            p={4}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              },
            }}
          >
            <VStack spacing={4} align="stretch">
              {displayMessages.length === 0 ? (
                <Flex justify="center" align="center" height="100%">
                  <Text color="gray.500">
                    No messages yet. Start the conversation!
                  </Text>
                </Flex>
              ) : (
                displayMessages.map((message) => (
                  <Flex
                    key={message.id}
                    justify={message.senderId === currentUser?.uid ? 'flex-end' : 'flex-start'}
                  >
                    <Box
                      maxWidth="70%"
                      p={3}
                      borderRadius="lg"
                      bg={message.senderId === currentUser?.uid ? myMessageBg : messageBg}
                      position="relative"
                    >
                      {message.img && (
                        <Image 
                          src={message.img} 
                          borderRadius="md" 
                          mb={2} 
                          maxHeight="200px"
                          onClick={() => {
                            setUploadedImage(message.img || null);
                            onOpen();
                          }}
                          cursor="pointer"
                        />
                      )}
                      {message.text && <Text>{message.text}</Text>}
                      <HStack
                        spacing={2}
                        justify="flex-end"
                        mt={1}
                        fontSize="xs"
                        color="gray.500"
                      >
                        <Text>
                          {message.date && moment(message.date.toDate()).format('HH:mm')}
                        </Text>
                        
                        {/* Unsend option for own messages */}
                        {message.senderId === currentUser?.uid && (
                          <Menu>
                            <MenuButton 
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="xs"
                              aria-label="Message options"
                            />
                            <MenuList>
                              <MenuItem 
                                icon={<FiTrash2 />}
                                onClick={() => unsendMessage(message.id)}
                              >
                                Unsend
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        )}
                      </HStack>
                    </Box>
                  </Flex>
                ))
              )}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* Input */}
          <HStack
            p={4}
            borderTop="1px"
            borderColor={borderColor}
            spacing={4}
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <IconButton
              aria-label="Send image"
              icon={<FiImage />}
              onClick={handleImageClick}
              variant="ghost"
            />
            <Input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              colorScheme="teal"
              onClick={handleSend}
              isLoading={isSubmitting}
            >
              <FiSend />
            </Button>
          </HStack>
        </>
      ) : (
        <Flex justify="center" align="center" height="100%">
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">
              Select a chat to start messaging
            </Text>
            <Text color="gray.400">
              Or search for users to start a new conversation
            </Text>
          </VStack>
        </Flex>
      )}

      {/* Image Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {uploadedImage && (
              <Image 
                src={uploadedImage} 
                alt="Preview" 
                maxH="70vh" 
                mx="auto" 
              />
            )}
            
            {/* Only show confirm/cancel buttons if this is an upload preview */}
            {selectedImage && (
              <HStack spacing={4} justify="center" mt={4}>
                <Button onClick={cancelImageUpload}>Cancel</Button>
                <Button colorScheme="teal" onClick={confirmImageUpload}>
                  Send Image
                </Button>
              </HStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Chat; 