import React, { useCallback, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  useToast,
  VStack,
  Image,
  Button,
  Card,
  CardBody,
  Stack,
  Divider,
  CardFooter,
  ButtonGroup,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaShoppingCart } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  similarity: number;
}

const ImageSearch: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleAddToCart = async (product: Product) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add item to cart',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    // Send image to backend for processing
    setIsSearching(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://127.0.0.1:5000/api/search', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process image search');
      }

      setSearchResults(data.products);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process image search',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
  });

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Heading>Visual Product Search</Heading>
        <Text>Upload an image to find similar products</Text>

        {/* Upload Area */}
        <Box
          {...getRootProps()}
          w="full"
          h="300px"
          border="2px dashed"
          borderColor={isDragActive ? 'blue.500' : borderColor}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          bg={useColorModeValue('gray.50', 'gray.900')}
          transition="all 0.2s"
          _hover={{ borderColor: 'blue.500' }}
        >
          <input {...getInputProps()} />
          <VStack spacing={2}>
            <FaUpload size="2em" />
            <Text>
              {isDragActive
                ? 'Drop the image here'
                : 'Drag and drop an image here, or click to select'}
            </Text>
          </VStack>
        </Box>

        {/* Preview */}
        {uploadedImage && (
          <Box>
            <Image
              src={uploadedImage}
              alt="Uploaded preview"
              maxH="300px"
              objectFit="contain"
            />
          </Box>
        )}

        {/* Loading State */}
        {isSearching && (
          <Box textAlign="center">
            <Spinner size="xl" />
            <Text mt={4}>Analyzing image and finding similar products...</Text>
          </Box>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {searchResults.map((product) => (
              <Card key={product.id} maxW="sm">
                <CardBody>
                  <Image
                    src={product.image}
                    alt={product.name}
                    borderRadius="lg"
                  />
                  <Stack mt="6" spacing="3">
                    <Heading size="md">{product.name}</Heading>
                    <Text>{product.description}</Text>
                    <Text color="blue.600" fontSize="2xl">
                      ${product.price.toFixed(2)}
                    </Text>
                    {product.similarity && (
                      <Text color="green.500">
                        {Math.round(product.similarity * 100)}% match
                      </Text>
                    )}
                  </Stack>
                </CardBody>
                <Divider />
                <CardFooter>
                  <ButtonGroup spacing="2">
                    <Button
                      variant="solid"
                      colorScheme="blue"
                      leftIcon={<FaShoppingCart />}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to cart
                    </Button>
                    <Button variant="ghost">View details</Button>
                  </ButtonGroup>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default ImageSearch; 