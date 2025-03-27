import React, { useState, useEffect } from 'react';
import { Box, Flex, IconButton, useMediaQuery } from '@chakra-ui/react';
import { FiArrowLeft, FiMenu } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';

interface MobileLayoutProps {
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ sidebarContent, mainContent }) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { data } = useChat();

  // Toggle sidebar view based on chat selection on mobile
  useEffect(() => {
    if (isMobile && data.user) {
      setShowSidebar(false);
    }
  }, [data.user, isMobile]);

  // Reset to sidebar view if no chat is selected
  useEffect(() => {
    if (isMobile && data.chatId === 'null') {
      setShowSidebar(true);
    }
  }, [data.chatId, isMobile]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (!isMobile) {
    // On desktop, show both sidebar and main content
    return (
      <Flex direction="row" h="calc(100vh - 64px)" w="100%">
        {sidebarContent}
        {mainContent}
      </Flex>
    );
  }

  // On mobile, toggle between sidebar and main content
  return (
    <Box h="calc(100vh - 64px)" w="100%" position="relative">
      {showSidebar ? (
        // Sidebar view (with menu button)
        <Box h="100%" w="100%">
          {data.user && (
            <IconButton
              aria-label="Show chat"
              icon={<FiArrowLeft />}
              position="absolute"
              top="1rem"
              right="1rem"
              zIndex="10"
              onClick={toggleSidebar}
              size="sm"
              variant="ghost"
            />
          )}
          {sidebarContent}
        </Box>
      ) : (
        // Main content view (with back button)
        <Box h="100%" w="100%">
          <IconButton
            aria-label="Show sidebar"
            icon={<FiMenu />}
            position="absolute"
            top="1rem"
            left="1rem"
            zIndex="10"
            onClick={toggleSidebar}
            size="sm"
            variant="ghost"
          />
          {mainContent}
        </Box>
      )}
    </Box>
  );
};

export default MobileLayout; 