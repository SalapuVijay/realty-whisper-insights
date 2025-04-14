
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, HelpCircle, Loader2, Sparkles, Key } from "lucide-react";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUESTIONS = [
  "What factors should I consider when investing in a rental property?",
  "How do I calculate cap rate for a property?",
  "Show me real estate market trends in Austin, Texas",
  "Find investment properties in Miami, Florida",
  "Analyze a property at 123 Main St, San Francisco, CA 94105"
];

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [mashvisorApiKey, setMashvisorApiKey] = useState(localStorage.getItem("mashvisor_api_key") || "");
  const [zillowApiKey, setZillowApiKey] = useState(localStorage.getItem("zillow_api_key") || "");

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

  const saveApiKeys = () => {
    localStorage.setItem("mashvisor_api_key", mashvisorApiKey);
    localStorage.setItem("zillow_api_key", zillowApiKey);
    setIsApiDialogOpen(false);
    toast("API keys saved successfully", {
      description: "Your API keys have been securely saved to your browser's local storage."
    });
  };

  return (
    <div className="border-t p-4 bg-background/30 backdrop-blur-sm">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end gap-2 relative"
      >
        <div className="flex-1 relative">
          <Input
            className="w-full bg-white/60 backdrop-blur-sm border-realty-200 focus-visible:ring-realty-500 pr-10 pl-10 shadow-sm rounded-full"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          
          <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-realty-700 rounded-full"
                type="button"
              >
                <Key className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span>API Key Settings</span>
                </DialogTitle>
                <DialogDescription>
                  Enter your API keys to enable real property data
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mashvisor" className="text-right">
                    Mashvisor
                  </Label>
                  <Input
                    id="mashvisor"
                    type="password"
                    value={mashvisorApiKey}
                    onChange={(e) => setMashvisorApiKey(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zillow" className="text-right">
                    Zillow
                  </Label>
                  <Input
                    id="zillow"
                    type="password"
                    value={zillowApiKey}
                    onChange={(e) => setZillowApiKey(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveApiKeys} className="bg-gradient-to-r from-realty-600 to-realty-700">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-realty-700 rounded-full"
                type="button"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4 glass-card">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-realty-500" />
                  <h4 className="text-sm font-medium text-realty-800">Sample questions</h4>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-realty-200 to-transparent"></div>
                <ul className="text-xs space-y-2">
                  {SAMPLE_QUESTIONS.map((question, i) => (
                    <li key={i} className="hover-card-effect">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-2 text-left justify-start text-realty-600 hover:text-realty-800 hover:bg-realty-50/50 w-full rounded-lg"
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
          className="bg-gradient-to-r from-realty-600 to-realty-700 hover:from-realty-700 hover:to-realty-800 shadow-md transition-all hover:shadow-lg active:scale-95 rounded-full"
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
