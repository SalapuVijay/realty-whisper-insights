
import React from 'react';
import { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User, Loader2, Clock, MapPin, Building, Database, Map } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Define the proper type for the code component props
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  // Detect if the message contains property data or a special visualization
  const hasPropertyData = message.content.includes("**Property") && 
                        (message.content.includes("Purchase Price") || 
                         message.content.includes("Monthly Rent"));
  
  const hasWalkScore = message.content.includes("**Walk Score**") || 
                       message.content.includes("walkability score");
  
  const hasNearbyPlaces = message.content.includes("**Nearby Places**") || 
                         message.content.includes("amenities near");
  
  const hasPropertyHistory = message.content.includes("**Property History**") || 
                            message.content.includes("ownership history");
  
  return (
    <div
      className={cn(
        "flex w-full gap-3 animate-fade-in mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-9 w-9 ring-2 ring-realty-600/30 bg-gradient-to-br from-realty-600 to-realty-700 text-white hover:scale-110 transition-transform cursor-pointer shadow-md">
              <Bot className="h-5 w-5" />
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-52 p-4 glass-card">
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-semibold text-realty-800">RealtyWhisper AI</h4>
              <p className="text-xs text-muted-foreground">Your personal real estate analysis assistant</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-realty-600">
                <Clock className="h-3 w-3" />
                <span>Available 24/7</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
      
      <Card
        className={cn(
          "px-4 py-3 max-w-[85%] sm:max-w-[75%] transition-all message-card relative",
          isUser 
            ? "bg-gradient-to-r from-realty-600 to-realty-700 text-white shadow-lg rounded-2xl rounded-tr-none border-none" 
            : "glass-card rounded-2xl rounded-tl-none border-realty-200/30 backdrop-blur-md"
        )}
      >
        {message.isTyping ? (
          <div className="typing-animation flex items-center space-x-2">
            <span className="font-medium">Thinking</span>
            <Loader2 className="h-4 w-4 animate-spin text-realty-300" />
          </div>
        ) : (
          <div className="space-y-1">
            {/* Special data visualizations */}
            {!isUser && hasPropertyData && (
              <div className="mb-2 p-1 bg-realty-50/50 rounded-md border border-realty-100">
                <div className="flex items-center gap-1 text-xs font-medium text-realty-700 mb-1 px-2 pt-1">
                  <Building className="h-3 w-3" />
                  <span>Property Data</span>
                </div>
              </div>
            )}
            
            {!isUser && hasWalkScore && (
              <div className="mb-2 p-1 bg-realty-50/50 rounded-md border border-realty-100">
                <div className="flex items-center gap-1 text-xs font-medium text-realty-700 mb-1 px-2 pt-1">
                  <MapPin className="h-3 w-3" />
                  <span>Walkability Report</span>
                </div>
              </div>
            )}
            
            {!isUser && hasNearbyPlaces && (
              <div className="mb-2 p-1 bg-realty-50/50 rounded-md border border-realty-100">
                <div className="flex items-center gap-1 text-xs font-medium text-realty-700 mb-1 px-2 pt-1">
                  <Map className="h-3 w-3" />
                  <span>Nearby Amenities</span>
                </div>
              </div>
            )}
            
            {!isUser && hasPropertyHistory && (
              <div className="mb-2 p-1 bg-realty-50/50 rounded-md border border-realty-100">
                <div className="flex items-center gap-1 text-xs font-medium text-realty-700 mb-1 px-2 pt-1">
                  <Database className="h-3 w-3" />
                  <span>Property History</span>
                </div>
              </div>
            )}
            
            <ReactMarkdown
              // Use type assertion to resolve plugin type issues
              remarkPlugins={[remarkGfm as any]}
              rehypePlugins={[rehypeHighlight as any]}
              className={cn(
                "prose-sm max-w-none break-words",
                !isUser && "prose-headings:text-realty-700 prose-a:text-realty-600"
              )}
              components={{
                table: (props) => (
                  <div className="overflow-x-auto my-2 rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200 text-xs" {...props} />
                  </div>
                ),
                tr: (props) => <tr className="border-b hover:bg-muted/50 transition-colors" {...props} />,
                th: (props) => <th className="px-2 py-1 font-medium bg-muted/30" {...props} />,
                td: (props) => <td className="px-2 py-1" {...props} />,
                p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                a: (props) => <a className="text-blue-500 hover:underline hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                ul: (props) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                ol: (props) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                li: (props) => <li className="mb-1" {...props} />,
                h1: (props) => <h1 className="text-lg font-bold mt-3 mb-1 pb-1 border-b" {...props} />,
                h2: (props) => <h2 className="text-base font-bold mt-3 mb-1 pb-1 border-b" {...props} />,
                h3: (props) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                strong: (props) => <strong className="font-bold text-realty-700" {...props} />,
                hr: () => <hr className="my-2 border-gray-200" />,
                // Fix inline prop by typing the code component correctly
                code: ({ className, children, ...props }: CodeProps) => {
                  return (
                    <code
                      className={`${className} px-1 py-0.5 bg-gray-200 rounded font-mono text-sm`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            
            <div className="text-xs opacity-70 text-right pt-1 flex items-center justify-end gap-1">
              <Clock className="h-3 w-3" />
              {timestamp}
            </div>
          </div>
        )}
      </Card>
      
      {isUser && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-9 w-9 ring-2 ring-realty-400/30 bg-gradient-to-br from-realty-500 to-realty-600 hover:bg-realty-700 text-white hover:scale-110 transition-transform cursor-pointer shadow-md">
              <User className="h-5 w-5" />
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-52 p-4 glass-card">
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-semibold text-realty-800">You</h4>
              <p className="text-xs text-muted-foreground">Property investor</p>
              <div className="h-px w-full bg-gradient-to-r from-realty-200 to-transparent"></div>
              <div className="text-xs text-realty-600 italic">Ask me about investment properties</div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};

export default ChatMessage;
