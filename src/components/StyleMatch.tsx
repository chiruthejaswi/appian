import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Image,
  Button,
  Input,
  useColorModeValue,
  IconButton,
  Flex,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { FaUpload, FaSearch } from 'react-icons/fa';

interface StyleProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  matchScore: number;
  styleAttributes: string[];
}

const StyleMatch: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<StyleProduct[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        analyzeStyle();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeStyle = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock results
    const mockResults: StyleProduct[] = [
      {
        id: '1',
        name: 'Similar Style Dress',
        price: 89.99,
        image: 'https://via.placeholder.com/150',
        matchScore: 95,
        styleAttributes: ['Floral', 'Summer', 'Casual'],
      },
      {
        id: '2',
        name: 'Matching Blouse',
        price: 49.99,
        image: 'https://via.placeholder.com/150',
        matchScore: 90,
        styleAttributes: ['Bohemian', 'Lightweight', 'Versatile'],
      },
      {
        id: '3',
        name: 'Complementary Skirt',
        price: 59.99,
        image: 'https://via.placeholder.com/150',
        matchScore: 85,
        styleAttributes: ['A-line', 'Midi', 'Elegant'],
      },
    ];

    setSearchResults(mockResults);
    setIsAnalyzing(false);
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
            Style Match
          </Heading>
          <Text color="gray.600">
            Upload an image or enter a description to find similar styles
          </Text>
        </Box>

        <Flex gap={4}>
          <Box flex={1}>
            <Input
              type="text"
              placeholder="Describe the style you're looking for..."
              size="lg"
            />
          </Box>
          <IconButton
            aria-label="Search styles"
            icon={<FaSearch />}
            size="lg"
            colorScheme="blue"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <IconButton
              as="span"
              aria-label="Upload image"
              icon={<FaUpload />}
              size="lg"
              colorScheme="green"
              cursor="pointer"
            />
          </label>
        </Flex>

        {selectedImage && (
          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            borderColor={borderColor}
          >
            <Image
              src={selectedImage}
              alt="Uploaded style"
              maxH="300px"
              w="100%"
              objectFit="cover"
            />
          </Box>
        )}

        {isAnalyzing && (
          <Box>
            <Text mb={2}>Analyzing style...</Text>
            <Progress size="xs" isIndeterminate colorScheme="blue" />
          </Box>
        )}

        {searchResults.length > 0 && (
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            {searchResults.map((product) => (
              <Box
                key={product.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                bg={bgColor}
                borderColor={borderColor}
              >
                <Image src={product.image} alt={product.name} />
                <Box p={4}>
                  <Badge colorScheme="purple" mb={2}>
                    {product.matchScore}% Style Match
                  </Badge>
                  <Heading size="sm" mb={2}>
                    {product.name}
                  </Heading>
                  <Flex wrap="wrap" gap={2} mb={2}>
                    {product.styleAttributes.map((attr, index) => (
                      <Badge key={index} colorScheme="blue" variant="outline">
                        {attr}
                      </Badge>
                    ))}
                  </Flex>
                  <Text fontWeight="bold" mb={2}>
                    ${product.price.toFixed(2)}
                  </Text>
                  <Button colorScheme="blue" size="sm" width="full">
                    View Details
                  </Button>
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>
    </Box>
  );
};

export default StyleMatch; 