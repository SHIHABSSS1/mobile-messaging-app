import React from 'react';
import { Box, Flex, HStack, Button, Avatar, Text, Menu, MenuButton, MenuList, MenuItem, useColorMode, IconButton } from '@chakra-ui/react';
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <Box
      as="nav"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      boxShadow="md"
      position="fixed"
      top="0"
      width="100%"
      zIndex="10"
    >
      <Flex
        h={16}
        alignItems={'center'}
        justifyContent={'space-between'}
        px={4}
      >
        <HStack spacing={8} alignItems={'center'}>
          <Text fontSize="xl" fontWeight="bold" color={colorMode === 'light' ? 'teal.500' : 'teal.300'}>
            MessageApp
          </Text>
        </HStack>
        <Flex alignItems={'center'}>
          <IconButton
            mr={4}
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          {currentUser && (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar 
                  size={'sm'} 
                  name={currentUser.displayName || undefined} 
                  src={currentUser.photoURL || undefined} 
                />
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 