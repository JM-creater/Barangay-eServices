export interface Requirement {
  id: number;
  requirementName: string;
  description?: string;
  isMandatory: boolean;
}

export interface ServiceItem {
  id: number;
  serviceCode: string;
  name: string;
  description: string;
  fee: number;
  estimatedProcessingDays: number;
  instructions?: string;
  isActive: boolean;
  requirements: Requirement[];
}

export interface ServiceCreatePayload {
  serviceCode: string;
  name: string;
  description: string;
  fee: number;
  estimatedProcessingDays?: number;
  instructions?: string;
  requirements?: {
    requirementName: string;
    description?: string;
    isMandatory?: boolean;
  }[];
}

export interface ServiceUpdatePayload {
  name: string;
  description: string;
  fee: number;
  estimatedProcessingDays?: number;
  instructions?: string;
  isActive?: boolean;
}
