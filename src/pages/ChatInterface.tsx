import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, LogOut, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingDots } from "@/components/LoadingDots";
import { sendVoiceMessage, setLanguage, Expertise, Language } from "@/lib/api";
import { personaImages } from "@/lib/personaImages";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  audioBlob?: Blob;
  audioUrl?: string;
  summary?: string;
  references?: string[];
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  // Handle YouTube Shorts URLs
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }
  
  // Handle regular YouTube URLs
  const regularMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (regularMatch) {
    return `https://www.youtube.com/embed/${regularMatch[1]}`;
  }
  
  return null;
};

const ChatInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialExpertise = (location.state?.expertise as Expertise) || "actor";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [currentExpertise] = useState<Expertise>(initialExpertise);
  const [language, setLanguageState] = useState<Language>("English");
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await setLanguage(newLanguage);
      setLanguageState(newLanguage);
      toast({
        title: "Language Updated",
        description: `Language set to ${newLanguage}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update language",
        variant: "destructive",
      });
    }
  };

  const handlePlayAudio = (message: Message) => {
    if (!message.audioBlob) return;

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking on currently playing message, just stop
    if (playingMessageId === message.id) {
      setPlayingMessageId(null);
      return;
    }

    const audioUrl = URL.createObjectURL(message.audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setPlayingMessageId(message.id);
    audio.onended = () => {
      setPlayingMessageId(null);
      URL.revokeObjectURL(audioUrl);
    };
    audio.onerror = () => {
      setPlayingMessageId(null);
      URL.revokeObjectURL(audioUrl);
    };

    audio.play();
  };

  const toggleSummary = (messageId: string) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

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
      const { audioBlob, references, summary } = await sendVoiceMessage(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Voice response ready",
        isUser: false,
        audioBlob,
        summary,
        references: references.length > 0 ? references : undefined,
      };
      setMessages((prev) => [...prev, aiMessage]);
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

  const renderSummaryBullets = (summary: string) => {
    const bullets = summary.split(/[.!?]+/).filter(s => s.trim());
    return (
      <ul className="space-y-1 text-sm text-muted-foreground mt-2">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex gap-2">
            <span>•</span>
            <span>{bullet.trim()}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderAIMessage = (message: Message) => {
    const isPlaying = playingMessageId === message.id;
    const isSummaryExpanded = expandedSummaries.has(message.id);

    return (
      <div key={message.id} className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
          <img 
            src={personaImages[currentExpertise]} 
            alt="Suniel Shetty"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-3">
          {/* Main response bubble with Play button */}
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={isPlaying ? "default" : "outline"}
                onClick={() => handlePlayAudio(message)}
                className="gap-2"
              >
                <Play className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'Playing...' : 'Play'}
              </Button>
              
              {message.summary && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleSummary(message.id)}
                  className="gap-1 text-muted-foreground"
                >
                  Summary
                  {isSummaryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              )}
            </div>

            {/* Summary section - only visible when expanded */}
            {message.summary && isSummaryExpanded && (
              <div className="mt-3 pt-3 border-t border-border">
                {renderSummaryBullets(message.summary)}
              </div>
            )}
          </div>

          {/* Embedded YouTube videos - only if references exist */}
          {message.references && message.references.length > 0 && (
            <div className="space-y-3">
              {message.references.map((ref, idx) => {
                const embedUrl = getYouTubeEmbedUrl(ref);
                if (!embedUrl) return null;
                return (
                  <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                    <iframe
                      src={embedUrl}
                      title={`Reference video ${idx + 1}`}
                      className="w-full aspect-[9/16] max-h-[400px]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
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
            {playingMessageId && (
              <div className="flex items-center gap-1.5 text-primary text-xs">
                <Play className="w-3 h-3 animate-pulse" />
                <span>Playing...</span>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("isAdmin");
              navigate("/");
            }}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
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
          
          {messages.map((message) => (
            message.isUser ? (
              <div key={message.id} className="flex gap-3 items-start justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                  {message.content}
                </div>
              </div>
            ) : (
              renderAIMessage(message)
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