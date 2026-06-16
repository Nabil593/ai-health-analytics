"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { UploadZone } from "@/components/patient/upload-zone";
import { PatientProfile, MedicalRecord, AuditLog } from "@/types/medical";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableTableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Pill, ShieldAlert, User } from "lucide-react";

// Mock Initial Profile (If local storage is empty)
const INITIAL_PROFILE: PatientProfile = {
  patientId: "PAT-2026-09X",
  name: "Shariea Reza Nabil",
  age: 20,
  gender: "Male",
  records: [],
  status: "Active",
};

export default function PatientDashboard() {
  const [profile, setProfile] = useLocalStorage<PatientProfile>(
    "patient_profile",
    INITIAL_PROFILE,
  );
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>(
    "system_audit_logs",
    [],
  );
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Handle successful AI Data Extraction
  const handleAnalysisSuccess = (extractedData: any) => {
    const newRecord: MedicalRecord = {
      recordId: `REC-${Date.now()}`,
      date: extractedData.date || new Date().toISOString().split("T")[0],
      doctorName: extractedData.doctorName || "Unknown Doctor",
      patientCase: extractedData.patientCase || "General Consultation",
      respiratoryRate: extractedData.respiratoryRate || "N/A",
      bloodPressure: extractedData.bloodPressure || "N/A",
      medicines: extractedData.medicines || [],
      testResults: extractedData.testResults || [],
    };

    setProfile((prev) => ({
      ...prev,
      records: [newRecord, ...prev.records], // Newest records on top
    }));

    setActiveTab("history"); // Auto switch to history view
  };

  // Log audit trail into localStorage for Admin view
  const handleLogAudit = (
    fileName: string,
    status: "Success" | "Failed",
    errorMsg?: string,
  ) => {
    const newLog: AuditLog = {
      logId: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      fileName,
      status,
      errorMessage: errorMsg,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 👤 Patient Identity Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-md">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {profile.name}
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                ID: {profile.patientId} • Age: {profile.age} • Gender:{" "}
                {profile.gender}
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            Status: {profile.status}
          </div>
        </CardContent>
      </Card>

      {/* 🎛️ Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="upload"
            className="rounded-lg py-2 text-sm font-medium transition-all"
          >
            Upload Prescription
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg py-2 text-sm font-medium transition-all"
          >
            Medical History Ledger ({profile.records.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Upload Zone */}
        <TabsContent value="upload" className="mt-6">
          <UploadZone
            onAnalysisSuccess={handleAnalysisSuccess}
            onLogAudit={handleLogAudit}
          />
        </TabsContent>

        {/* Tab 2: Medical History Ledger */}
        <TabsContent value="history" className="mt-6">
          {profile.records.length === 0 ? (
            <Card className="border-slate-200 bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <FileText size={48} className="stroke-1 mb-3" />
                <p className="font-medium text-slate-600">
                  No medical records found
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Please upload your first prescription under the upload tab to
                  trigger AI extraction.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {profile.records.map((record) => (
                <Card
                  key={record.recordId}
                  className="border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
                        <Calendar size={16} className="text-blue-600" />
                        <span>{record.date}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600 font-medium text-sm">
                          {record.doctorName}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {record.recordId}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Symptoms/Case */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Clinical Summary
                      </h4>
                      <p className="text-slate-700 text-sm mt-1 font-medium">
                        {record.patientCase}
                      </p>
                    </div>

                    {/* Vitals */}
                    <div className="grid grid-cols-2 gap-4 max-w-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                          Resp. Rate (RR)
                        </span>
                        <span className="text-slate-700 text-sm font-semibold">
                          {record.respiratoryRate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                          Blood Pressure (BP)
                        </span>
                        <span className="text-slate-700 text-sm font-semibold">
                          {record.bloodPressure || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Medicines Sub-table */}
                    {record.medicines.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Pill size={12} className="text-blue-500" />{" "}
                          Prescribed Medications
                        </h4>
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50/70">
                              <TableTableRow>
                                <TableHead className="h-8 text-xs font-semibold">
                                  Medicine Name
                                </TableHead>
                                <TableHead className="h-8 text-xs font-semibold">
                                  Dosage
                                </TableHead>
                                <TableHead className="h-8 text-xs font-semibold">
                                  Duration
                                </TableHead>
                                <TableHead className="h-8 text-xs font-semibold">
                                  Category
                                </TableHead>
                              </TableTableRow>
                            </TableHeader>
                            <TableBody>
                              {record.medicines.map((med, idx) => (
                                <TableTableRow
                                  key={idx}
                                  className="hover:bg-transparent"
                                >
                                  <TableCell className="py-2 text-sm font-medium text-slate-800">
                                    {med.name}
                                  </TableCell>
                                  <TableCell className="py-2 text-sm text-slate-600">
                                    {med.dosage}
                                  </TableCell>
                                  <TableCell className="py-2 text-sm text-slate-600">
                                    {med.duration}
                                  </TableCell>
                                  <TableCell className="py-2 text-sm">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                        med.category === "Antibiotic"
                                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {med.category}
                                    </span>
                                  </TableCell>
                                </TableTableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
