const BASE_URL = "http://40.90.232.96:8082";
const PERSONA_ID = "sunil_shetty";

export type Expertise = "actor" | "businessman" | "fitness" | "life_coach";
export type Humor = "calm" | "happy" | "strict" | "funny";
export type ExpertLevel = "basic" | "normal" | "advanced" | "elite";

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

export const setExpertLevel = async (expert_level: ExpertLevel): Promise<void> => {
  const response = await fetch(`${BASE_URL}/persona/${PERSONA_ID}/set-expert-level`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expert_level }),
  });

  if (!response.ok) {
    throw new Error("Failed to set expert level");
  }
};

export interface VoiceResponse {
  audioBlob: Blob;
  references: string[];
}

export const sendVoiceMessage = async (text: string): Promise<VoiceResponse> => {
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

  // Get X-References header
  const referencesHeader = response.headers.get("X-References") || "";
  const references = referencesHeader
    ? referencesHeader.split(",").map((ref) => ref.trim()).filter(Boolean)
    : [];

  const audioBlob = await response.blob();

  return { audioBlob, references };
};
