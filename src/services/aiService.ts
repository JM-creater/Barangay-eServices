import api from './api';

export interface AiPredictionRequest {
  serviceId?: number;
  serviceCode?: string;
  purpose?: string;
  submittedDocsCount?: number;
  requiredDocsCount?: number;
  submissionHour?: number;
  submissionDayOfWeek?: number;
  isResident?: boolean;
}

export interface AiPredictionResponse {
  serviceCode: string;
  serviceName: string;
  fee: number;
  predictedTurnaroundHours: number;
  predictedTurnaroundDays: number;
  assessmentCategory: 'READY_FOR_APPROVAL' | 'STANDARD_REVIEW' | 'NEEDS_CORRECTION_RISK' | string;
  confidenceScore: number;
  fastTrackEligible: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  aiRecommendations: string[];
  inferenceLatencyMs: number;
  executionEngine: string;
}

export interface AiModelStatusResponse {
  // Model 1: Turnaround
  modelLoaded: boolean;
  modelPath: string;
  version: string;
  runtimeEngine: string;
  modelSizeBytes: number;
  inputFeatures: string[];
  outputClasses: string[];
  accuracyScore: number;
  trainedAt: string | null;
  totalInferencesProcessed: number;
  averageInferenceLatencyMs: number;
  // Model 2: Assistant NLP
  assistantModelLoaded?: boolean;
  assistantModelPath?: string;
  assistantVersion?: string;
  assistantModelSizeBytes?: number;
  assistantVocabularySize?: number;
  assistantIntents?: string[];
  assistantAccuracyScore?: number;
  assistantTrainedAt?: string | null;
  assistantTotalInferences?: number;
  assistantAverageLatencyMs?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: string;
}

export interface AiChatResponse {
  reply: string;
  suggestedPrompts: string[];
  relatedServices: string[];
  engine: string;
  detectedIntent?: string;
  confidenceScore?: number;
  actionLink?: string;
  contextBadge?: string;
}

export interface AiContextualPromptsResponse {
  contextBadge: string;
  primaryPrompt: string;
  suggestedPrompts: string[];
  actionLink?: string;
}

export interface AiGenerateRemarksRequest {
  serviceName?: string;
  applicantName?: string;
  actionType: 'REQUEST_CORRECTION' | 'APPROVE_ENDORSEMENT' | 'REJECTION_REASON' | string;
  missingRequirements?: string[];
  specificNotes?: string;
}

export interface AiGenerateRemarksResponse {
  generatedRemarks: string;
  subject: string;
  suggestedAction: string;
}

export const aiService = {
  predictTurnaround: async (payload: AiPredictionRequest): Promise<AiPredictionResponse> => {
    const response = await api.post<AiPredictionResponse>('/ai/predict', payload);
    return response.data;
  },

  getModelStatus: async (): Promise<AiModelStatusResponse> => {
    const response = await api.get<AiModelStatusResponse>('/ai/model-status');
    return response.data;
  },

  reloadModel: async (): Promise<{ reloaded: boolean; message: string; status: AiModelStatusResponse }> => {
    const response = await api.post<{ reloaded: boolean; message: string; status: AiModelStatusResponse }>('/ai/model-reload');
    return response.data;
  },

  reloadAssistantModel: async (): Promise<{ reloaded: boolean; message: string }> => {
    const response = await api.post<{ reloaded: boolean; message: string }>('/ai/assistant/model-reload');
    return response.data;
  },

  chatWithAiAssistant: async (payload: AiChatRequest): Promise<AiChatResponse> => {
    const response = await api.post<AiChatResponse>('/ai/assistant/chat', payload);
    return response.data;
  },

  getQuickPrompts: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/ai/assistant/quick-prompts');
    return response.data;
  },

  getContextualPrompts: async (params?: { page?: string; serviceCode?: string; referenceNumber?: string }): Promise<AiContextualPromptsResponse> => {
    const response = await api.get<AiContextualPromptsResponse>('/ai/assistant/contextual-prompts', { params });
    return response.data;
  },

  generateRemarks: async (payload: AiGenerateRemarksRequest): Promise<AiGenerateRemarksResponse> => {
    const response = await api.post<AiGenerateRemarksResponse>('/ai/generate-remarks', payload);
    return response.data;
  },
};
