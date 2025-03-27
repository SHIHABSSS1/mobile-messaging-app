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

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string; confirmPassword?: string}>({});
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const { signup, currentUser } = useAuth();
  
  const bg = useColorModeValue('white', 'gray.800');

  // Redirect if user is already logged in
  if (currentUser) {
    return <Navigate to="/" />;
  }

  const validateForm = () => {
    const newErrors: {name?: string; email?: string; password?: string; confirmPassword?: string} = {};
    
    if (!name) {
      newErrors.name = 'Display name is required';
    }
    
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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSignupError(null);
    
    try {
      await signup(email, password, name);
    } catch (error: any) {
      console.error(error);
      setSignupError(error.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={{ base: '12', md: '24' }}>
      <Box bg={bg} p="8" borderRadius="lg" boxShadow="lg">
        <Stack spacing="8">
          <Stack spacing="6" textAlign="center">
            <Heading size="xl">Create an account</Heading>
            <Text color="gray.500">
              Sign up to start messaging with your friends
            </Text>
          </Stack>

          {signupError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {signupError}
            </Alert>
          )}

          <form onSubmit={handleSignup}>
            <Stack spacing="6">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">Display Name</FormLabel>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

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

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                fontSize="md"
                isLoading={loading}
              >
                Sign up
              </Button>
            </Stack>
          </form>

          <Stack spacing="0" align="center">
            <Text>
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="teal.500">
                Log in
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};

export default Signup; 