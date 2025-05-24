import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Input,
  IconButton,
  Text,
  useColorModeValue,
  Flex,
  Avatar,
  Container,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import { chatAPI } from '../services/api';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  context?: {
    products?: string[];
    categories?: string[];
    colors?: string[];
    priceRange?: string;
  };
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your shopping assistant. I can help you find products, answer questions about items, and provide style recommendations. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatAPI.sendMessage(input);

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMessage: Message = {
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        context: data.context || {},
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      const fallbackMessage: Message = {
        text: "I apologize, but I'm having trouble processing your request at the moment. Please try again in a few moments, or you can try rephrasing your question.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" p={4}>
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        h="600px"
        display="flex"
        flexDirection="column"
      >
        <VStack
          flex={1}
          overflowY="auto"
          spacing={4}
          align="stretch"
          mb={4}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('gray.300', 'gray.600'),
              borderRadius: '24px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Flex
              key={index}
              justify={message.isUser ? 'flex-end' : 'flex-start'}
              align="start"
            >
              {!message.isUser && (
                <Avatar
                  size="sm"
                  name="AI Assistant"
                  src="/ai-avatar.png"
                  mr={2}
                  mt={1}
                />
              )}
              <Box
                bg={message.isUser ? 'blue.500' : 'gray.100'}
                color={message.isUser ? 'white' : 'black'}
                px={4}
                py={2}
                borderRadius="lg"
                maxW="70%"
              >
                <Text whiteSpace="pre-wrap">{message.text}</Text>
                {!message.isUser && message.context && (
                  <VStack align="start" spacing={1} mt={2}>
                    {message.context.products && message.context.products.length > 0 && (
                      <Text fontSize="sm" color="gray.500">
                        Products: {message.context.products.join(', ')}
                      </Text>
                    )}
                    {message.context.categories && message.context.categories.length > 0 && (
                      <Text fontSize="sm" color="gray.500">
                        Categories: {message.context.categories.join(', ')}
                      </Text>
                    )}
                    {message.context.colors && message.context.colors.length > 0 && (
                      <Text fontSize="sm" color="gray.500">
                        Colors: {message.context.colors.join(', ')}
                      </Text>
                    )}
                  </VStack>
                )}
                <Text
                  fontSize="xs"
                  color={message.isUser ? 'white' : 'gray.500'}
                  mt={1}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Text>
              </Box>
            </Flex>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
        <Flex>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            mr={2}
          />
          <IconButton
            colorScheme="blue"
            aria-label="Send message"
            icon={isLoading ? <Spinner size="sm" /> : <FaPaperPlane />}
            onClick={handleSendMessage}
            isLoading={isLoading}
          />
        </Flex>
      </Box>
    </Container>
  );
};

export default AIAssistant; 