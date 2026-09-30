import { User } from './User';
import { ServiceItem } from './Service';
import { Appointment } from './Appointment';

export type RequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'PROCESSING'
  | 'READY_FOR_RELEASE'
  | 'RELEASED'
  | 'NEEDS_CORRECTION'
  | 'REJECTED'
  | 'CANCELLED';

export interface RequestFile {
  id: number;
  requirementId?: number;
  requirementName?: string;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  fileUrl?: string;
  uploadedAt: string;
}

export interface RequestStatusHistory {
  id: number;
  previousStatus?: string;
  newStatus: string;
  remarks?: string;
  changedByName?: string;
  createdAt: string;
}

export interface DocumentRequest {
  id: number;
  referenceNumber: string;
  resident: User;
  service: ServiceItem;
  purpose: string;
  submittedDataJson?: string;
  assignedStaff?: User;
  currentStatus: RequestStatus;
  remarks?: string;
  rejectionReason?: string;
  correctionNotes?: string;
  appointment?: Appointment;
  files: RequestFile[];
  history: RequestStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRelease {
  id: number;
  requestId: number;
  referenceNumber: string;
  serviceName: string;
  releaseReferenceNo: string;
  issuedDocumentNumber: string;
  recipientName: string;
  releasingOfficerName: string;
  officialApproverName?: string;
  paymentAmount: number;
  officialReceiptNumber?: string;
  paymentStatus: string;
  releaseDate: string;
  remarks?: string;
}

export interface DocumentPreview {
  requestId: number;
  referenceNumber: string;
  serviceName: string;
  serviceCode: string;
  recipientName: string;
  address: string;
  purpose: string;
  issuedDocumentNumber: string;
  officialReceiptNumber: string;
  paymentAmount: number;
  issueDate: string;
  validUntil: string;
  officialApproverName: string;
  officialApproverTitle: string;
  currentStatus: string;
  verificationUrl: string;
  qrCodeData: string;
  renderedHtml: string;
}

export interface DocumentVerification {
  verified: boolean;
  issuedDocumentNumber?: string;
  releaseReferenceNo?: string;
  serviceName?: string;
  serviceCode?: string;
  recipientName?: string;
  releaseDate?: string;
  officialReceiptNumber?: string;
  officialApproverName?: string;
  releasingOfficerName?: string;
  status?: string;
  barangayName?: string;
  message?: string;
}

