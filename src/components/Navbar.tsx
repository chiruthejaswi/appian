import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useColorModeValue,
  useColorMode,
  Button,
} from '@chakra-ui/react';
import { FaMoon, FaSun, FaShoppingCart } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bg} px={4} shadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Link as={RouterLink} to="/" fontSize="xl" fontWeight="bold">
            ShopSmarter
          </Link>
          <HStack as="nav" spacing={4}>
            <Link as={RouterLink} to="/products">Products</Link>
            <Link as={RouterLink} to="/search">Image Search</Link>
            <Link as={RouterLink} to="/assistant">AI Assistant</Link>
          </HStack>
        </HStack>

        <Flex alignItems="center">
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            mr={4}
          />
          <Button
            as={RouterLink}
            to="/cart"
            leftIcon={<FaShoppingCart />}
            colorScheme="blue"
            variant="ghost"
          >
            Cart
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 