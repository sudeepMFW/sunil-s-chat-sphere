import { User, Mic } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isPlaying?: boolean;
}

export const ChatMessage = ({ content, isUser, isPlaying }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-secondary" : "gold-gradient"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Mic className={`w-4 h-4 text-primary-foreground ${isPlaying ? "animate-pulse-glow" : ""}`} />
        )}
      </div>
      
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
        isUser 
          ? "bg-secondary text-secondary-foreground" 
          : "bg-card border border-border text-card-foreground"
      }`}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
};
