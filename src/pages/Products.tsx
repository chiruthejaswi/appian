import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Button,
  VStack,
  Heading,
  useToast,
  Container,
  Badge,
  useColorModeValue,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  features: string[];
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(products);
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/search/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: activeFilters,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFilteredProducts(data.products);
        if (data.suggestedFilters && data.suggestedFilters.length > 0) {
          // Add suggested filters if they're not already active
          const newFilters = data.suggestedFilters.filter(
            (filter: string) => !activeFilters.includes(filter)
          );
          if (newFilters.length > 0) {
            setActiveFilters([...activeFilters, ...newFilters]);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to search products');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to search products',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setFilteredProducts(products); // Fallback to all products
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts();
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
    searchProducts();
  };

  const addToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please login to add items to cart',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `${product.name} added to cart`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Our Products</Heading>
        
        {/* Search Bar */}
        <Box as="form" onSubmit={handleSearchSubmit}>
          <InputGroup size="lg">
            <Input
              placeholder="Search products (e.g., 'pink t-shirt' or 'blue denim jacket')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pr="4.5rem"
            />
            <InputRightElement width="4.5rem">
              {isSearching ? (
                <Spinner />
              ) : (
                <Button h="1.75rem" size="sm" onClick={searchProducts}>
                  <FaSearch />
                </Button>
              )}
            </InputRightElement>
          </InputGroup>
        </Box>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <HStack spacing={2} wrap="wrap">
            {activeFilters.map((filter) => (
              <Tag
                key={filter}
                size="md"
                borderRadius="full"
                variant="solid"
                colorScheme="blue"
              >
                <TagLabel>{filter}</TagLabel>
                <TagCloseButton onClick={() => removeFilter(filter)} />
              </Tag>
            ))}
          </HStack>
        )}

        {/* Products Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredProducts.map((product) => (
            <Box
              key={product.id}
              bg={bgColor}
              borderWidth="1px"
              rounded="lg"
              shadow="lg"
              position="relative"
              p={4}
            >
              <Image
                src={product.image}
                alt={product.name}
                height="200px"
                width="100%"
                objectFit="cover"
                borderRadius="md"
                fallbackSrc="https://via.placeholder.com/300x200"
              />
              <VStack mt={4} spacing={2} align="start">
                <Heading size="md">{product.name}</Heading>
                <Badge colorScheme="blue">{product.category}</Badge>
                <Text>{product.description}</Text>
                <HStack spacing={2} wrap="wrap">
                  {product.features.map((feature) => (
                    <Tag key={feature} size="sm" colorScheme="gray">
                      {feature}
                    </Tag>
                  ))}
                </HStack>
                <Text fontWeight="bold" fontSize="xl">
                  ${product.price.toFixed(2)}
                </Text>
                <Button
                  leftIcon={<FaShoppingCart />}
                  colorScheme="blue"
                  width="full"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Products; 