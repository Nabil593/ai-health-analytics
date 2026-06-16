export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  category: "Antibiotic" | "Vitamin" | "Calcium" | "Gastric" | "Others";
}

export interface DiagnosticTestResult {
  testName: string;
  value: string;
}

export interface MedicalRecord {
  recordId: string;
  date: string; // YYYY-MM-DD
  doctorName: string;
  patientCase: string; // Patient Case / Symptoms Summary
  respiratoryRate: string; // RR
  bloodPressure?: string; // BP (Optional)
  medicines: Medicine[];
  testResults: DiagnosticTestResult[];
}

export interface PatientProfile {
  patientId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  records: MedicalRecord[];
  status: "Active" | "Suspended";
}

export interface AuditLog {
  logId: string;
  timestamp: string;
  fileName: string;
  status: "Success" | "Failed";
  errorMessage?: string;
}
