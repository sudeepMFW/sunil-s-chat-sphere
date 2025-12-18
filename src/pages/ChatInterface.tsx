import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Volume2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { LoadingDots } from "@/components/LoadingDots";
import { sendVoiceMessage, Expertise } from "@/lib/api";
import { personaImages } from "@/lib/personaImages";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  isReference?: boolean;
  referenceUrl?: string;
}

const ChatInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialExpertise = (location.state?.expertise as Expertise) || "actor";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentExpertise] = useState<Expertise>(initialExpertise);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { audioBlob, references } = await sendVoiceMessage(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "🎙️ Voice response",
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Add reference messages if any
      if (references.length > 0) {
        const referenceMessages: Message[] = references.map((ref, index) => ({
          id: (Date.now() + 2 + index).toString(),
          content: ref,
          isUser: false,
          isReference: true,
          referenceUrl: ref,
        }));
        setMessages((prev) => [...prev, ...referenceMessages]);
      }

      // Play audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/personas")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
            <img 
              src={personaImages[currentExpertise]} 
              alt="Suniel Shetty"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground">Suniel Shetty</h1>
            {isSpeaking && (
              <div className="flex items-center gap-1.5 text-primary text-xs">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Start a conversation with Suniel Shetty
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            message.isReference ? (
              <div key={message.id} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
                  <img 
                    src={personaImages[currentExpertise]} 
                    alt="Suniel Shetty"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <a 
                    href={message.referenceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="break-all">{message.content}</span>
                  </a>
                </div>
              </div>
            ) : (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                isPlaying={!message.isUser && isSpeaking && index === messages.length - 1}
                avatarImage={personaImages[currentExpertise]}
              />
            )
          ))}
          
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
                <img 
                  src={personaImages[currentExpertise]} 
                  alt="Suniel Shetty"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <LoadingDots />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-secondary border-border focus-visible:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="gold-gradient text-primary-foreground hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
