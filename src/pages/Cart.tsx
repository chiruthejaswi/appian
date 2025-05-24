import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Divider,
  useColorModeValue,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import GooglePayButton from "@google-pay/button-react";
import AIAssistant from '../components/AIAssistant';
import SmartCheckout from '../components/SmartCheckout';
import StyleMatch from '../components/StyleMatch';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCartItems(data.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
        description: item.product.description,
      })));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch cart items',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          product_id: id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update quantity');
      }

      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update quantity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          product_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove item');
      }

      await fetchCartItems(); // Refresh cart items
      
      toast({
        title: 'Item removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove item',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/google-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ paymentData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }

      toast({
        title: 'Payment Successful',
        description: 'Thank you for your purchase!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await fetchCartItems(); // Refresh cart items (should be empty after successful payment)
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading>Shopping Cart</Heading>

        {isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading your cart...</Text>
          </Box>
        ) : cartItems.length === 0 ? (
          <Text>Your cart is empty</Text>
        ) : (
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>Cart Items</Tab>
              <Tab>Smart Checkout</Tab>
              <Tab>Style Match</Tab>
              <Tab>AI Assistant</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {cartItems.map((item) => (
                    <Box
                      key={item.id}
                      p={4}
                      bg={bgColor}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      shadow="sm"
                    >
                      <HStack spacing={4} justify="space-between">
                        <HStack spacing={4}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <VStack align="start" spacing={1}>
                            <Heading size="md">{item.name}</Heading>
                            <Text color="blue.500" fontSize="lg">
                              ${item.price.toFixed(2)}
                            </Text>
                            {item.description && (
                              <Text color="gray.600" fontSize="sm">
                                {item.description}
                              </Text>
                            )}
                          </VStack>
                        </HStack>

                        <HStack spacing={4}>
                          <NumberInput
                            value={item.quantity}
                            min={1}
                            max={99}
                            w="100px"
                            onChange={(_, value) => updateQuantity(item.id, value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>

                          <IconButton
                            aria-label="Remove item"
                            icon={<FaTrash />}
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeItem(item.id)}
                          />
                        </HStack>
                      </HStack>
                    </Box>
                  ))}

                  <Divider />

                  <Box p={4}>
                    <HStack justify="space-between" fontSize="xl" fontWeight="bold">
                      <Text>Total:</Text>
                      <Text>${total.toFixed(2)}</Text>
                    </HStack>
                  </Box>

                  <GooglePayButton
                    environment="TEST"
                    paymentRequest={{
                      apiVersion: 2,
                      apiVersionMinor: 0,
                      allowedPaymentMethods: [{
                        type: 'CARD',
                        parameters: {
                          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                          allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
                        },
                        tokenizationSpecification: {
                          type: 'PAYMENT_GATEWAY',
                          parameters: {
                            gateway: 'example',
                            gatewayMerchantId: 'exampleGatewayMerchantId'
                          }
                        }
                      }],
                      merchantInfo: {
                        merchantId: '12345678901234567890',
                        merchantName: 'Demo Merchant'
                      },
                      transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPriceLabel: 'Total',
                        totalPrice: total.toFixed(2),
                        currencyCode: 'USD',
                        countryCode: 'US'
                      }
                    }}
                    onLoadPaymentData={handlePaymentSuccess}
                  />
                </VStack>
              </TabPanel>

              <TabPanel>
                <SmartCheckout cartTotal={total} onAddToCart={fetchCartItems} />
              </TabPanel>

              <TabPanel>
                <StyleMatch />
              </TabPanel>

              <TabPanel>
                <AIAssistant />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Container>
  );
};

export default Cart;