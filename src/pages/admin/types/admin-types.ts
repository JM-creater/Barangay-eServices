export interface DiagnosticScenario {
    id: string;
    label: string;
    badge: string;
    badgeColor: string;
    badgeBg: string;
    serviceCode: string;
    docsStatus: 'complete' | 'missing' | 'none';
    submissionTime: 'morning' | 'afternoon';
    purpose: string;
    isResident: boolean;
}

export const diagnosticScenarios: DiagnosticScenario[] = [
    {
        id: 'fast-track',
        label: 'Fast-Track Candidate',
        badge: '~4-12h • Priority',
        badgeColor: '#166534',
        badgeBg: '#DCFCE7',
        serviceCode: 'BC-CLEARANCE',
        docsStatus: 'complete',
        submissionTime: 'morning',
        purpose: 'Local Employment & Job Application',
        isResident: true,
    },
    {
        id: 'indigency-urgent',
        label: 'Indigency Medical Aid',
        badge: '~12h • Expedited',
        badgeColor: '#166534',
        badgeBg: '#DCFCE7',
        serviceCode: 'BC-INDIGENCY',
        docsStatus: 'complete',
        submissionTime: 'morning',
        purpose: 'Hospitalization and Medical Assistance at Vicente Sotto',
        isResident: true,
    },
    {
        id: 'residency-standard',
        label: 'Residency Verification',
        badge: '~24h • Standard',
        badgeColor: '#1E40AF',
        badgeBg: '#DBEAFE',
        serviceCode: 'BC-RESIDENCY',
        docsStatus: 'complete',
        submissionTime: 'afternoon',
        purpose: 'Bank Account Opening & Proof of Residence',
        isResident: true,
    },
    {
        id: 'business-clearance',
        label: 'Commercial Business Permit',
        badge: '~48h • Business',
        badgeColor: '#7E22CE',
        badgeBg: '#F3E8FF',
        serviceCode: 'BC-BUSINESS',
        docsStatus: 'complete',
        submissionTime: 'morning',
        purpose: 'Barangay Business Clearance for Sari-Sari Store',
        isResident: true,
    },
    {
        id: 'missing-docs',
        label: 'Incomplete / Missing Files Risk',
        badge: '~60h • Rectification',
        badgeColor: '#92400E',
        badgeBg: '#FEF3C7',
        serviceCode: 'BC-CLEARANCE',
        docsStatus: 'missing',
        submissionTime: 'afternoon',
        purpose: 'General ID requirement',
        isResident: true,
    },
];

export const serviceIdMap: Record<string, number> = {
    'BC-CLEARANCE': 1,
    'BC-INDIGENCY': 2,
    'BC-RESIDENCY': 3,
    'BC-BUSINESS': 4,
    'BC-GOODMORAL': 5,
};

export const requiredMap: Record<string, number> = {
    'BC-CLEARANCE': 2,
    'BC-INDIGENCY': 1,
    'BC-RESIDENCY': 2,
    'BC-BUSINESS': 2,
    'BC-GOODMORAL': 1,
};

export const sampleQueries = [
    { label: 'Business Clearance Fee (Bisaya)', query: 'Pila ang bayad sa barangay business clearance?' },
    { label: 'Clearance Requirements (English)', query: 'What do I need to bring for barangay clearance?' },
    { label: 'Check Reference Status', query: 'Where is my application REQ-202610-0001 right now?' },
    { label: 'Office Hours (Bisaya)', query: 'Unsa orasa abli ang barangay hall ug kanus-a manirado?' },
    { label: 'Fix Rejected ID (Correction)', query: 'My valid ID was rejected, how do I re-upload?' },
    { label: 'Indigency Requirements (Bisaya)', query: 'Unsaon pagkuha ug indigency para sa tambal ug hospital?' },
];