"use client";

import React, { useState, createContext, useContext } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { BottomNav } from "@/components/shell/BottomNav";
import { ScolyProvider, useScoly } from "@/lib/store";
import { Payment, Student } from "@/types/scoly";
import { ImportSourceType } from "@/types/import";

// Lazy-load modals — only loaded when user opens them
const PaymentModal = dynamic(() => import("@/components/payments/PaymentModal").then(m => ({ default: m.PaymentModal })), { ssr: false });
const ReceiptModal = dynamic(() => import("@/components/payments/ReceiptModal").then(m => ({ default: m.ReceiptModal })), { ssr: false });
const StudentModal = dynamic(() => import("@/components/students/StudentModal").then(m => ({ default: m.StudentModal })), { ssr: false });
const ReminderModal = dynamic(() => import("@/components/debts/ReminderModal").then(m => ({ default: m.ReminderModal })), { ssr: false });
const ImportModal = dynamic(() => import("@/components/import/ImportModal").then(m => ({ default: m.ImportModal })), { ssr: false });

interface GlobalModalContextType {
  openPaymentModal: (studentId?: string) => void;
  openReceiptModal: (payment: Payment | string) => void;
  openStudentModal: (studentToEdit?: Student | null) => void;
  openReminderModal: (student: Student, channel?: "whatsapp" | "sms") => void;
  openImportModal: (initialSource?: ImportSourceType) => void;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function useGlobalModals() {
  const context = useContext(GlobalModalContext);
  if (!context) {
    throw new Error("useGlobalModals must be used within DashboardShellContent");
  }
  return context;
}

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const { payments } = useScoly();

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedStudentForReminder, setSelectedStudentForReminder] = useState<Student | null>(null);
  const [reminderChannel, setReminderChannel] = useState<"whatsapp" | "sms">("whatsapp");

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInitialSource, setImportInitialSource] = useState<ImportSourceType>("excel");

  const openPaymentModal = (studentId?: string) => {
    setPreselectedStudentId(studentId);
    setIsPaymentModalOpen(true);
  };

  const openReceiptModal = (paymentOrId: Payment | string) => {
    if (typeof paymentOrId === "string") {
      const found = payments.find((p) => p.id === paymentOrId);
      if (found) setSelectedPayment(found);
    } else {
      setSelectedPayment(paymentOrId);
    }
    setIsReceiptModalOpen(true);
  };

  const openStudentModal = (student?: Student | null) => {
    setStudentToEdit(student || null);
    setIsStudentModalOpen(true);
  };

  const openReminderModal = (student: Student, channel: "whatsapp" | "sms" = "whatsapp") => {
    setSelectedStudentForReminder(student);
    setReminderChannel(channel);
    setIsReminderModalOpen(true);
  };

  const openImportModal = (initialSource: ImportSourceType = "excel") => {
    setImportInitialSource(initialSource);
    setIsImportModalOpen(true);
  };

  return (
    <GlobalModalContext.Provider
      value={{
        openPaymentModal,
        openReceiptModal,
        openStudentModal,
        openReminderModal,
        openImportModal,
      }}
    >
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
        {/* Persistent Sidebar on Desktop/Tablet */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            onOpenPaymentModal={() => openPaymentModal()}
            onSelectPaymentReceipt={(paymentId) => openReceiptModal(paymentId)}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 pb-24 md:pb-8 bg-slate-50/60">
            <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
              {children}
            </div>
          </main>
        </div>

        {/* Bottom Navigation for Mobile (iOS & Android) */}
        <BottomNav onOpenPaymentModal={() => openPaymentModal()} />

        {/* Global Modals */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          preselectedStudentId={preselectedStudentId}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPreselectedStudentId(undefined);
          }}
          onSuccess={(newPayment) => {
            setSelectedPayment(newPayment);
            setIsReceiptModalOpen(true);
          }}
        />

        <ReceiptModal
          isOpen={isReceiptModalOpen}
          payment={selectedPayment}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedPayment(null);
          }}
        />

        <StudentModal
          isOpen={isStudentModalOpen}
          studentToEdit={studentToEdit}
          onClose={() => {
            setIsStudentModalOpen(false);
            setStudentToEdit(null);
          }}
        />

        <ReminderModal
          isOpen={isReminderModalOpen}
          student={selectedStudentForReminder}
          initialChannel={reminderChannel}
          onClose={() => {
            setIsReminderModalOpen(false);
            setSelectedStudentForReminder(null);
          }}
        />

        <ImportModal
          isOpen={isImportModalOpen}
          initialSource={importInitialSource}
          onClose={() => setIsImportModalOpen(false)}
        />
      </div>
    </GlobalModalContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScolyProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </ScolyProvider>
  );
}
