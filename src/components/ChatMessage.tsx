import { User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isPlaying?: boolean;
  avatarImage?: string;
}

export const ChatMessage = ({ content, isUser, isPlaying, avatarImage }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      ) : (
        <div className={`w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 ${
          isPlaying ? "border-primary animate-pulse" : "border-primary/50"
        }`}>
          <img 
            src={avatarImage} 
            alt="Suniel Shetty"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className={`max-w-[80%] px-4 py-3 ${
        isUser 
          ? "bg-secondary text-secondary-foreground rounded-2xl rounded-tr-sm" 
          : "bg-card border border-border text-card-foreground rounded-2xl rounded-tl-sm"
      }`}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
};
