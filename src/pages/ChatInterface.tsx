import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, LogOut, Play, ChevronDown, ChevronUp, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingDots } from "@/components/LoadingDots";
import { sendVoiceMessage, sendVoiceMessageRahul, sendVideoMessageRahul, setLanguage, Expertise, Language, PersonaType } from "@/lib/api";
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
  uploadedVideoUrl?: string; // For KL Rahul video uploads
  hasPlayed?: boolean; // Track if audio has been auto-played
}

const getYouTubeVideoId = (url: string): string | null => {
  // Handle YouTube Shorts URLs
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return shortsMatch[1];
  }
  
  // Handle regular YouTube URLs
  const regularMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (regularMatch) {
    return regularMatch[1];
  }
  
  return null;
};

const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const ChatInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialExpertise = (location.state?.expertise as PersonaType) || "actor";
  const isKlRahul = location.state?.isKlRahul || false;
  const personaName = location.state?.personaName || "Suniel Shetty";
  const personaImage = location.state?.personaImage || personaImages[initialExpertise as Expertise];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [currentExpertise] = useState<PersonaType>(initialExpertise);
  const [language, setLanguageState] = useState<Language>("English");
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [playingVideoRef, setPlayingVideoRef] = useState<string | null>(null);
  const [expandedReferences, setExpandedReferences] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedVideoRef = useRef<HTMLVideoElement | null>(null);

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

  const autoPlayAudio = (audioBlob: Blob, messageId: string, uploadedVideoUrl?: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => {
      setPlayingMessageId(messageId);
      // If there's an uploaded video, start playing it simultaneously
      if (uploadedVideoUrl) {
        setPlayingVideoRef(messageId);
        setTimeout(() => {
          if (uploadedVideoRef.current) {
            uploadedVideoRef.current.play();
          }
        }, 100);
      }
    };

    audio.onended = () => {
      setPlayingMessageId(null);
      setPlayingVideoRef(null);
      URL.revokeObjectURL(audioUrl);
      // Mark message as played
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, hasPlayed: true } : m
      ));
      // Pause uploaded video
      if (uploadedVideoRef.current) {
        uploadedVideoRef.current.pause();
      }
    };
    audio.onerror = () => {
      setPlayingMessageId(null);
      setPlayingVideoRef(null);
      URL.revokeObjectURL(audioUrl);
      if (uploadedVideoRef.current) {
        uploadedVideoRef.current.pause();
      }
    };

    audio.play();
  };

  const toggleReferenceVideo = (refKey: string) => {
    setExpandedReferences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(refKey)) {
        newSet.delete(refKey);
      } else {
        newSet.add(refKey);
      }
      return newSet;
    });
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

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate video file types
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid video file (mp4, mov, avi, webm)",
          variant: "destructive",
        });
        return;
      }
      setSelectedVideo(file);
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedVideo) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: selectedVideo 
        ? `${inputValue.trim() || ''} [Video: ${selectedVideo.name}]`.trim()
        : inputValue.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue.trim();
    const videoFile = selectedVideo;
    setInputValue("");
    setSelectedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    try {
      let response;
      let uploadedVideoUrl: string | undefined;
      
      if (isKlRahul) {
        if (videoFile) {
          // Video upload for KL Rahul - create URL for playback
          uploadedVideoUrl = URL.createObjectURL(videoFile);
          response = await sendVideoMessageRahul(videoFile, messageText || undefined);
        } else {
          // Text only for KL Rahul
          response = await sendVoiceMessageRahul(messageText);
        }
      } else {
        // Regular Suniel Shetty personas
        response = await sendVoiceMessage(messageText);
      }

      const { audioBlob, references, summary } = response;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Voice response ready",
        isUser: false,
        audioBlob,
        summary,
        references: references.length > 0 ? references : undefined,
        uploadedVideoUrl,
        hasPlayed: false,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Auto-play audio for ALL voice responses
      setPlayingMessageId(aiMessage.id);
      autoPlayAudio(audioBlob, aiMessage.id, uploadedVideoUrl);
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
    // Split by sentences (. ! ?) but keep meaningful content
    const bullets = summary
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    return (
      <ul className="space-y-2 text-sm text-muted-foreground mt-2">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex gap-2 items-start">
            <span className="text-primary mt-0.5">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    );
  };

  const getDisplayImage = () => {
    if (isKlRahul) {
      return personaImage;
    }
    return personaImages[currentExpertise as Expertise] || personaImage;
  };

  const renderAIMessage = (message: Message) => {
    const isPlaying = playingMessageId === message.id;
    const isSummaryExpanded = expandedSummaries.has(message.id);
    const isVideoPlaying = playingVideoRef === message.id;

    return (
      <div key={message.id} className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
          <img 
            src={getDisplayImage()} 
            alt={personaName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-3">
          {/* Uploaded video playback - for KL Rahul video uploads */}
          {message.uploadedVideoUrl && (
            <div className={`bg-card border rounded-xl overflow-hidden ${isVideoPlaying ? 'border-primary' : 'border-border'}`}>
              <video
                ref={isVideoPlaying ? uploadedVideoRef : undefined}
                src={message.uploadedVideoUrl}
                className="w-full max-h-[300px] object-contain bg-black"
                controls={false}
                muted={false}
              />
              {isVideoPlaying && (
                <div className="px-3 py-2 bg-primary/10 text-primary text-xs flex items-center gap-2">
                  <Play className="w-3 h-3 animate-pulse" />
                  Coach is reviewing your video...
                </div>
              )}
            </div>
          )}

          {/* Main response bubble with Play/Replay button */}
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={isPlaying ? "default" : "outline"}
                onClick={() => handlePlayAudio(message)}
                className="gap-2"
              >
                <Play className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'Playing...' : message.hasPlayed ? 'Replay' : 'Play'}
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

          {/* YouTube reference thumbnails - only if references exist */}
          {message.references && message.references.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {message.references.map((ref, idx) => {
                const videoId = getYouTubeVideoId(ref);
                if (!videoId) return null;
                const refKey = `${message.id}-${idx}`;
                const isExpanded = expandedReferences.has(refKey);
                
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    {/* Thumbnail with play overlay */}
                    {!isExpanded && (
                      <button
                        onClick={() => toggleReferenceVideo(refKey)}
                        className="relative group cursor-pointer rounded-xl overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <img
                          src={getYouTubeThumbnail(videoId)}
                          alt={`Reference ${idx + 1}`}
                          className="w-40 h-24 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          Reference {idx + 1}
                        </div>
                      </button>
                    )}
                    
                    {/* Expanded iframe player */}
                    {isExpanded && (
                      <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title={`Reference video ${idx + 1}`}
                          className="w-full aspect-video max-w-md"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <button
                          onClick={() => toggleReferenceVideo(refKey)}
                          className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    )}
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
              src={getDisplayImage()} 
              alt={personaName}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground">{personaName.split(' – ')[0]}</h1>
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
                Start a conversation with {personaName.split(' – ')[0]}
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
                  src={getDisplayImage()} 
                  alt={personaName}
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
        <div className="max-w-3xl mx-auto">
          {/* Video preview - only for KL Rahul */}
          {selectedVideo && (
            <div className="mb-3 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
              <span className="text-sm text-muted-foreground flex-1 truncate">
                📹 {selectedVideo.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveVideo}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-3">
            {/* Video upload button - only for KL Rahul */}
            {isKlRahul && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleVideoSelect}
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-shrink-0"
                  title="Upload video"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isKlRahul && selectedVideo ? "Add a message (optional)..." : "Type your message..."}
              disabled={isLoading}
              className="flex-1 bg-secondary border-border focus-visible:ring-primary"
            />
            <Button
              onClick={handleSendMessage}
              disabled={((!inputValue.trim() && !selectedVideo) || isLoading)}
              className="gold-gradient text-primary-foreground hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;