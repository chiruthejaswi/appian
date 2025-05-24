import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaImage, FaRobot, FaShoppingCart, FaMagic } from 'react-icons/fa';

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ElementType;
}

const Feature: React.FC<FeatureProps> = ({ title, text, icon }) => {
  return (
    <VStack
      p={5}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="lg"
      shadow="md"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      align="start"
      spacing={4}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Heading size="md">{title}</Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>{text}</Text>
    </VStack>
  );
};

const Home: React.FC = () => {
  return (
    <Container maxW="container.xl" py={10}>
      {/* Hero Section */}
      <Box textAlign="center" py={10}>
        <Heading
          as="h1"
          size="2xl"
          bgGradient="linear(to-r, blue.400, purple.500)"
          backgroundClip="text"
          mb={4}
        >
          Welcome to ShopSmarter
        </Heading>
        <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')} mb={8}>
          Your AI-Powered Personal Shopping Assistant
        </Text>
        <Button
          as={RouterLink}
          to="/search"
          colorScheme="blue"
          size="lg"
          rightIcon={<FaImage />}
          mr={4}
        >
          Start Image Search
        </Button>
        <Button
          as={RouterLink}
          to="/assistant"
          colorScheme="purple"
          size="lg"
          rightIcon={<FaRobot />}
        >
          Chat with AI Assistant
        </Button>
      </Box>

      {/* Features Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} py={10}>
        <Feature
          icon={FaImage}
          title="Visual Search"
          text="Upload any image and find similar products instantly"
        />
        <Feature
          icon={FaRobot}
          title="AI Assistant"
          text="Get personalized recommendations based on your preferences"
        />
        <Feature
          icon={FaShoppingCart}
          title="Smart Checkout"
          text="Streamlined and automated checkout process"
        />
        <Feature
          icon={FaMagic}
          title="Style Match"
          text="Find complementary items that match your style"
        />
      </SimpleGrid>
    </Container>
  );
};

export default Home; 