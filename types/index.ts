export interface VisionResult {
  objectType: string;
  material: string;
  condition: string;
  context: string;
  isEnvironmental: boolean;
  environmentalCategory: string | null;
}

export interface Personality {
  name: string;
  traits: string[];
  voiceDescription: string;
  monologue: string;
  systemPrompt: string;
}

export interface WhisperResult {
  id: string;
  objectName: string;
  personality: Personality;
  monologue: string;
  voiceId: string;
  audioBase64: string;
  facts: string[];
  isEnvironmental: boolean;
  entityName?: string;
  location?: GeoLocation;
  timestamp: number;
  imageBase64?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface TranscriptEntry {
  role: "user" | "object";
  text: string;
  timestamp: number;
}

export interface Clip {
  id: string;
  whisperId: string;
  objectName: string;
  entityName?: string;
  audioBlob?: string; // base64 of mixed audio
  voiceAudioBase64: string;
  timestamp: number;
}

export interface MapPin {
  id: string;
  whisperId: string;
  objectName: string;
  entityName?: string;
  location: GeoLocation;
  timestamp: number;
}

export interface EnvironmentalEntity {
  name: string;
  voiceDescription: string;
  searchQueries: string[];
  monologuePrompt: string;
}

export type ProcessingStage =
  | "capturing"
  | "recognizing"
  | "generating"
  | "speaking"
  | "idle";

export interface ConversationState {
  active: boolean;
  agentId: string | null;
  signedUrl: string | null;
  transcript: TranscriptEntry[];
}

export interface WhisperRequest {
  imageBase64: string;
  location?: GeoLocation;
}

export interface WhisperResponse {
  id: string;
  objectName: string;
  personality: Personality;
  monologue: string;
  voiceId: string;
  audioBase64: string;
  facts: string[];
  isEnvironmental: boolean;
  entityName?: string;
}

export interface ConversationRequest {
  voiceId: string;
  systemPrompt: string;
  facts: string[];
  objectName: string;
}

export interface ConversationResponse {
  agentId: string;
  signedUrl: string;
}
