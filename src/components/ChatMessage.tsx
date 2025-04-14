
import { ChatMessage as ChatMessageType } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  
  return (
    <div
      className={cn(
        "flex w-full gap-3 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-realty-700 text-white">
          <Bot className="h-5 w-5" />
        </Avatar>
      )}
      
      <Card
        className={cn(
          "px-4 py-3 max-w-[80%] sm:max-w-[70%]",
          isUser ? "bg-realty-700 text-white" : "bg-background border"
        )}
      >
        {message.isTyping ? (
          <div className="typing-animation font-medium">Thinking</div>
        ) : (
          <ReactMarkdown 
            className="prose-sm max-w-none break-words"
            // Use remarkPlugins as array of functions without additional options
            remarkPlugins={[remarkGfm]}
            components={{
              table: (props) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full divide-y divide-gray-200 text-xs" {...props} />
                </div>
              ),
              tr: (props) => <tr className="border-b" {...props} />,
              th: (props) => <th className="px-2 py-1 font-medium" {...props} />,
              td: (props) => <td className="px-2 py-1" {...props} />,
              p: (props) => <p className="mb-2 last:mb-0" {...props} />,
              a: (props) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              ul: (props) => <ul className="list-disc pl-4 my-2" {...props} />,
              ol: (props) => <ol className="list-decimal pl-4 my-2" {...props} />,
              li: (props) => <li className="mb-1" {...props} />,
              h1: (props) => <h1 className="text-lg font-bold mt-3 mb-1" {...props} />,
              h2: (props) => <h2 className="text-base font-bold mt-3 mb-1" {...props} />,
              h3: (props) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
              strong: (props) => <strong className="font-bold" {...props} />,
              hr: () => <hr className="my-2 border-gray-200" />,
              code: (props) => <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </Card>
      
      {isUser && (
        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground">
          <User className="h-5 w-5" />
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
