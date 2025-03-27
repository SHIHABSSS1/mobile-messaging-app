import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login, currentUser } = useAuth();
  
  const bg = useColorModeValue('white', 'gray.800');

  // Redirect if user is already logged in
  if (currentUser) {
    return <Navigate to="/" />;
  }

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setLoginError(null);
    
    try {
      await login(email, password);
    } catch (error: any) {
      console.error(error);
      setLoginError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={{ base: '12', md: '24' }}>
      <Box bg={bg} p="8" borderRadius="lg" boxShadow="lg">
        <Stack spacing="8">
          <Stack spacing="6" textAlign="center">
            <Heading size="xl">Log in to your account</Heading>
            <Text color="gray.500">
              Enter your email and password to access your chats
            </Text>
          </Stack>

          {loginError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {loginError}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing="6">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                fontSize="md"
                isLoading={loading}
              >
                Log in
              </Button>
            </Stack>
          </form>

          <Stack spacing="0" align="center">
            <Text>
              Don't have an account?{' '}
              <Link as={RouterLink} to="/signup" color="teal.500">
                Sign up
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login; 