
import { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
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
            <Avatar className="h-8 w-8 ring-2 ring-realty-700/20 bg-realty-700 text-white hover:scale-110 transition-transform cursor-pointer">
              <Bot className="h-5 w-5" />
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-48">
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-semibold">RealtyWhisper AI</h4>
              <p className="text-xs text-muted-foreground">Your real estate analysis assistant</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
      
      <Card
        className={cn(
          "px-4 py-3 max-w-[85%] sm:max-w-[75%] transition-all message-card relative",
          isUser ? "bg-realty-700 text-white shadow-lg" : "bg-background border shadow-sm"
        )}
      >
        {message.isTyping ? (
          <div className="typing-animation flex items-center space-x-2">
            <span className="font-medium">Thinking</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            <Markdown 
              className={cn(
                "prose-sm max-w-none break-words",
                !isUser && "prose-headings:text-realty-700 prose-a:text-realty-600"
              )}
              // @ts-ignore - Ignoring type compatibility issues between remark-gfm and react-markdown
              remarkPlugins={[remarkGfm]}
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
                code: (props) => <code className="bg-gray-100 rounded px-1 py-0.5 text-realty-700" {...props} />
              }}
            >
              {message.content}
            </Markdown>
            
            <div className="text-xs opacity-70 text-right pt-1">
              {timestamp}
            </div>
          </div>
        )}
      </Card>
      
      {isUser && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-8 w-8 ring-2 ring-realty-400/20 bg-realty-600 hover:bg-realty-700 text-white hover:scale-110 transition-transform cursor-pointer">
              <User className="h-5 w-5" />
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-48">
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-semibold">You</h4>
              <p className="text-xs text-muted-foreground">Property investor</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};

export default ChatMessage;
