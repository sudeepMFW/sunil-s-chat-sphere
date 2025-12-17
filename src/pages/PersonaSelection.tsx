import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PersonaCard } from "@/components/PersonaCard";
import { setExpertise, Expertise } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const personas = [
  {
    title: "Sunil Shetty – Actor",
    subtitle: "Cinema & Discipline",
    icon: "actor" as const,
    expertise: "actor" as Expertise,
  },
  {
    title: "Sunil Shetty – Businessman",
    subtitle: "Business & Ethics",
    icon: "businessman" as const,
    expertise: "businessman" as Expertise,
  },
  {
    title: "Sunil Shetty – Fitness Mentor",
    subtitle: "Health & Strength",
    icon: "fitness" as const,
    expertise: "fitness" as Expertise,
  },
  {
    title: "Sunil Shetty – Life Coach",
    subtitle: "Wisdom & Guidance",
    icon: "life_coach" as const,
    expertise: "life_coach" as Expertise,
  },
];

const PersonaSelection = () => {
  const [loadingExpertise, setLoadingExpertise] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChat = async (expertise: Expertise) => {
    setLoadingExpertise(expertise);
    try {
      await setExpertise([expertise]);
      navigate("/chat", { state: { expertise } });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingExpertise(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Chat with <span className="text-gold-gradient">Sunil Shetty</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose a persona to start your conversation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.expertise}
              title={persona.title}
              subtitle={persona.subtitle}
              icon={persona.icon}
              isLoading={loadingExpertise === persona.expertise}
              onChat={() => handleChat(persona.expertise)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonaSelection;
