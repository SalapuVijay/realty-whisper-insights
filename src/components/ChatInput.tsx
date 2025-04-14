
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUESTIONS = [
  "What factors should I consider when investing in a rental property?",
  "How do I calculate cap rate for a property?",
  "What are the current market trends in Austin, Texas?",
  "How much should I budget for property maintenance?",
  "What's a good debt-to-income ratio for property investment?"
];

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleSampleClick = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="border-t p-4 bg-background/50 backdrop-blur-sm">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end gap-2"
      >
        <div className="flex-1 relative">
          <Input
            className="w-full bg-white/80 border-realty-200 focus-visible:ring-realty-500 pr-10 shadow-sm"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-realty-700"
                type="button"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sample questions</h4>
                <ul className="text-xs space-y-1.5">
                  {SAMPLE_QUESTIONS.map((question, i) => (
                    <li key={i}>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-left justify-start text-realty-600 hover:text-realty-800"
                        onClick={() => handleSampleClick(question)}
                      >
                        {question}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        <Button 
          size="icon" 
          type="submit" 
          disabled={!message.trim() || isLoading}
          className="bg-realty-600 hover:bg-realty-700 shadow-md transition-all hover:shadow-lg active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
