import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { PersonaCard } from "@/components/PersonaCard";
import { Button } from "@/components/ui/button";
import { setExpertise, Expertise, PersonaType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Persona {
  title: string;
  subtitle: string;
  icon: "actor" | "businessman" | "fitness" | "life_coach" | "kl_rahul";
  personaType: PersonaType;
  image: string;
  isKlRahul?: boolean;
}

const personas: Persona[] = [
  {
    title: "Suniel Shetty – Actor",
    subtitle: "Cinema & Discipline",
    icon: "actor" as const,
    personaType: "actor" as Expertise,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgJhaSrgKwzbX-eVYBNh6KHja4QDUrT6UFtRy3eMtnGCDUNBVbxQPi8vfKX0ZEZckXX4driAkTRiog6COATyb_CJ8t6uCYVbjIG-m9CbbW-O1tVtxn4eDVXzbgIoWosJewPu2wLU699-YflK7TDN7Sv3lGMsuLDSfQO8rFScw58SOcatVYKj0tx3EEH1Otx/s768/sunil_shetty_003_1024x768_drhx.jpg",
  },
  {
    title: "Suniel Shetty – Businessman",
    subtitle: "Business & Ethics",
    icon: "businessman" as const,
    personaType: "businessman" as Expertise,
    image: "https://images.yourstory.com/cs/2/11718bd02d6d11e9aa979329348d4c3e/Imagelwtj-1599135426037.jpg?mode=crop&crop=faces&ar=2%3A1&format=auto&w=1920&q=75",
  },
  {
    title: "Suniel Shetty – Fitness Mentor",
    subtitle: "Health & Strength",
    icon: "fitness" as const,
    personaType: "fitness" as Expertise,
    image: "https://filmfare.wwmindia.com/content/2017/Jun/thum_1496462157.jpg",
  },
  {
    title: "Suniel Shetty – Life Coach",
    subtitle: "Wisdom & Guidance",
    icon: "life_coach" as const,
    personaType: "life_coach" as Expertise,
    image: "https://c.ndtvimg.com/gws/ms/sunil-shetty-actor-producer-and-more/assets/2.jpeg?1723380029",
  },
  {
    title: "KL Rahul – Cricket Fitness Coach",
    subtitle: "Elite cricket fitness & batting guidance",
    icon: "kl_rahul" as const,
    personaType: "kl_rahul",
    image: "https://sugermint.com/wp-content/uploads/2024/05/KL-Rahul.jpg",
    isKlRahul: true,
  },
];

const PersonaSelection = () => {
  const [loadingExpertise, setLoadingExpertise] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const handleChat = async (persona: Persona) => {
    setLoadingExpertise(persona.personaType);
    try {
      // Skip expertise API for KL Rahul
      if (!persona.isKlRahul) {
        await setExpertise([persona.personaType as Expertise]);
      }
      navigate("/chat", { 
        state: { 
          expertise: persona.personaType,
          isKlRahul: persona.isKlRahul || false,
          personaName: persona.title,
          personaImage: persona.image,
        } 
      });
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
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <img 
            src="https://mediafirewall.ai/images/logo.png" 
            alt="Media Firewall Logo" 
            className="h-10 object-contain"
          />
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Chat with <span className="text-gold-gradient">Suniel Shetty</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose a persona to start your conversation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.personaType}
              title={persona.title}
              subtitle={persona.subtitle}
              icon={persona.icon}
              image={persona.image}
              isLoading={loadingExpertise === persona.personaType}
              onChat={() => handleChat(persona)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonaSelection;
