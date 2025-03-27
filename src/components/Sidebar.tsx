import React from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Avatar, 
  Divider, 
  useColorModeValue,
  Button,
  Stack,
  Badge
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useChats } from '../hooks/useChat';
import { ChatUser } from '../context/ChatContext';
import moment from 'moment';

const Sidebar = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const { 
    users, 
    searchTerm, 
    setSearchTerm, 
    chats,
    loading, 
    handleSearch, 
    selectUser 
  } = useChats();

  // Sort chats by date (most recent first)
  const sortedChats = Object.entries(chats || {})
    .sort((a, b) => {
      return b[1].date?.seconds - a[1].date?.seconds || 0;
    });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      height="100%"
      width={{ base: '100%', md: '300px' }}
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      p={3}
    >
      <VStack spacing={4} align="stretch">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Find users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </InputGroup>

        {/* Search Results */}
        {users.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Search Results</Text>
            <VStack spacing={2} align="stretch">
              {users.map((user) => (
                <HStack 
                  key={user.uid}
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  cursor="pointer"
                  onClick={() => selectUser(user)}
                >
                  <Avatar size="sm" name={user.displayName} src={user.photoURL} />
                  <Text fontWeight="medium">{user.displayName}</Text>
                </HStack>
              ))}
            </VStack>
            <Divider my={3} />
          </Box>
        )}

        {/* Conversations */}
        <Text fontSize="sm" fontWeight="semibold">Conversations</Text>
        <VStack spacing={2} align="stretch" overflowY="auto">
          {sortedChats.length > 0 ? (
            sortedChats.map(([chatId, chatData]) => (
              <HStack 
                key={chatId}
                p={2}
                borderRadius="md"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                cursor="pointer"
                onClick={() => selectUser(chatData.userInfo as ChatUser)}
                position="relative"
              >
                <Avatar size="sm" name={chatData.userInfo.displayName} src={chatData.userInfo.photoURL} />
                <Box flex="1" overflow="hidden">
                  <Text fontWeight="medium" isTruncated>
                    {chatData.userInfo.displayName}
                  </Text>
                  {chatData.lastMessage && (
                    <Text fontSize="xs" color="gray.500" isTruncated>
                      {chatData.lastMessage.unsent ? (
                        <i>Message unsent</i>
                      ) : (
                        chatData.lastMessage.text
                      )}
                    </Text>
                  )}
                </Box>
                {chatData.date && (
                  <Text fontSize="xs" color="gray.500">
                    {moment(chatData.date.toDate()).fromNow()}
                  </Text>
                )}
              </HStack>
            ))
          ) : (
            <Stack spacing={3} pt={3} align="center">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                No conversations yet
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Search for users to start chatting
              </Text>
            </Stack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar; 