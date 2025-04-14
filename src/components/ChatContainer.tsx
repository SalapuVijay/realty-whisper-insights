
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ChatMessage as ChatMessageType } from "@/types";
import { processMessage, ChatContextType } from "@/utils/chatLogic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const ChatContainer = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "👋 Hello! I'm RealtyWhisper, your real estate investment analyst. How can I help you analyze properties today?",
      timestamp: new Date(),
    },
  ]);
  
  const [chatContext, setChatContext] = useState<ChatContextType>({
    property: null,
    setProperty: (property) => {
      setChatContext((prev) => ({ ...prev, property }));
    },
    analysis: null,
    comparisonProperties: [],
    addComparisonProperty: (property) => {
      setChatContext((prev) => ({
        ...prev,
        comparisonProperties: [...prev.comparisonProperties, property],
      }));
    },
    removeComparisonProperty: (id) => {
      setChatContext((prev) => ({
        ...prev,
        comparisonProperties: prev.comparisonProperties.filter(
          (prop) => prop.id !== id
        ),
      }));
    },
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessageId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      },
    ]);
    
    setIsProcessing(true);
    
    try {
      // Process the message
      const response = await processMessage(
        content,
        chatContext,
        setChatContext
      );
      
      // Replace loading message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                role: "assistant",
                content: response,
                timestamp: new Date(),
                isTyping: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Replace loading message with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                role: "assistant",
                content:
                  "I'm sorry, I encountered an error while processing your request. Please try again.",
                timestamp: new Date(),
                isTyping: false,
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background/40">
      <Card className="flex-none mx-4 mt-4 bg-background/70 backdrop-blur-sm border border-realty-100">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-realty-700 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Property Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 text-sm text-muted-foreground">
          Ask me about property analysis, market trends, or investment opportunities.
        </CardContent>
      </Card>
      
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="flex flex-col gap-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isProcessing} />
    </div>
  );
};

export default ChatContainer;
