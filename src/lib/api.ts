const BASE_URL = "https://enterprise-mediafirewall-ai.millionvisions.ai/";
const PERSONA_ID = "sunil_shetty";

export type Expertise = "actor" | "businessman" | "fitness" | "life_coach";
export type Humor = "calm" | "angry" | "strict" | "funny";

export const setExpertise = async (expertise: Expertise[]): Promise<void> => {
  const response = await fetch(`${BASE_URL}/persona/${PERSONA_ID}/set-expertise`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expertise }),
  });

  if (!response.ok) {
    throw new Error("Failed to set expertise");
  }
};

export const setHumor = async (humor: Humor): Promise<void> => {
  const response = await fetch(`${BASE_URL}/persona/${PERSONA_ID}/set-humor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ humor }),
  });

  if (!response.ok) {
    throw new Error("Failed to set humor");
  }
};

export const sendVoiceMessage = async (text: string): Promise<Blob> => {
  const response = await fetch(`${BASE_URL}/voice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      persona_id: PERSONA_ID,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get voice response");
  }

  return response.blob();
};
