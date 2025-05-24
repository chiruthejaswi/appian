import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Image,
  Button,
  Badge,
  useColorModeValue,
  Spinner,
  useToast,
} from '@chakra-ui/react';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  matchScore: number;
  reason: string;
  styleAttributes: string[];
}

interface SmartCheckoutProps {
  cartTotal: number;
  onAddToCart: (productId: string) => void;
}

const SmartCheckout: React.FC<SmartCheckoutProps> = ({ cartTotal, onAddToCart }) => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cartTotal,
          preferences: {
            style: 'casual', // This could be fetched from user preferences
            priceRange: cartTotal < 50 ? 'low' : cartTotal < 200 ? 'medium' : 'high',
            size: 'M', // This could be fetched from user preferences
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      setRecommendations(data.recommendations);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get recommendations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Set some fallback recommendations
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [cartTotal, toast]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleAddToCart = async (product: RecommendedProduct) => {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

      onAddToCart(product.id);
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

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
            Smart Recommendations
          </Heading>
          <Text color="gray.600">
            AI-powered suggestions based on your cart items and preferences
          </Text>
        </Box>

        {isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Analyzing your cart and generating personalized recommendations...</Text>
          </Box>
        ) : recommendations.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text>No recommendations available at the moment.</Text>
          </Box>
        ) : (
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            {recommendations.map((product) => (
              <Box
                key={product.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                bg={bgColor}
                borderColor={borderColor}
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.02)' }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  w="100%"
                  h="200px"
                  objectFit="cover"
                />
                <Box p={4}>
                  <Badge colorScheme="purple" mb={2}>
                    {product.matchScore}% Match
                  </Badge>
                  <Heading size="sm" mb={2}>
                    {product.name}
                  </Heading>
                  <Text color="gray.600" fontSize="sm" mb={2}>
                    {product.reason}
                  </Text>
                  <Box mb={2}>
                    {product.styleAttributes.map((attr, index) => (
                      <Badge key={index} colorScheme="blue" variant="outline" mr={1} mb={1}>
                        {attr}
                      </Badge>
                    ))}
                  </Box>
                  <Text fontWeight="bold" mb={2}>
                    ${product.price.toFixed(2)}
                  </Text>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    width="full"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Box>
            ))}
          </Grid>
        )}

        <Box
          mt={4}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="sm" mb={2}>
            Smart Savings
          </Heading>
          <Text color="gray.600">
            Adding recommended items could qualify you for additional discounts!
          </Text>
          <Text fontWeight="bold" color="green.500" mt={2}>
            Potential savings: ${(cartTotal * 0.1).toFixed(2)}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default SmartCheckout; 