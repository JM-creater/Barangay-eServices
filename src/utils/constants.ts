export const BARANGAY_INFO = {
  name: 'Barangay Cansojong',
  municipality: 'Talisay City',
  province: 'Cebu',
  fullLocation: 'Barangay Cansojong, Talisay City, Cebu 6045',
  contactEmail: 'info@cansojong.talisaycity.gov.ph',
  contactPhone: '(032) 272-0000 / 0917-123-4567',
  officeHours: 'Monday to Friday, 8:00 AM – 5:00 PM',
};

export const REQUEST_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    color: '#9e7500',
    bg: '#fef9e8',
    border: '#fae49d',
    desc: 'Application received and awaiting staff initial review',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: '#1e5c94',
    bg: '#f0f6fc',
    border: '#b8d7f4',
    desc: 'Barangay staff is verifying information and submitted attachments',
  },
  NEEDS_CORRECTION: {
    label: 'Needs Correction',
    color: '#9e7500',
    bg: '#fef9e8',
    border: '#fae49d',
    desc: 'Additional or clearer documents required. Please update and resubmit.',
  },
  ACCEPTED: {
    label: 'Accepted (Appointment Confirmed)',
    color: '#2E8B57',
    bg: '#edf7f2',
    border: '#a8dfc1',
    desc: 'Application approved for office appearance. Please attend your scheduled slot.',
  },
  PROCESSING: {
    label: 'Processing',
    color: '#3B82C4',
    bg: '#f0f6fc',
    border: '#b8d7f4',
    desc: 'In-person identity verified. Document is being prepared and routed for official signing.',
  },
  READY_FOR_RELEASE: {
    label: 'Ready for Release',
    color: '#2E8B57',
    bg: '#edf7f2',
    border: '#a8dfc1',
    desc: 'Document has been signed by authorized official and ready for claiming.',
  },
  RELEASED: {
    label: 'Released & Completed',
    color: '#1d613c',
    bg: '#edf7f2',
    border: '#a8dfc1',
    desc: 'Document successfully issued and released to recipient.',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#D64545',
    bg: '#fdf2f2',
    border: '#f8c0c0',
    desc: 'Application was rejected by staff. Slot has been freed.',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#58626e',
    bg: '#f5f7fa',
    border: '#dde3ea',
    desc: 'Application was cancelled.',
  },
  NO_SHOW: {
    label: 'No-Show / Missed',
    color: '#D64545',
    bg: '#fdf2f2',
    border: '#f8c0c0',
    desc: 'Scheduled appointment was missed. Please reschedule your appointment.',
  },
};
