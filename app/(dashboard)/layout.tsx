"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { BottomNav } from "@/components/shell/BottomNav";
import { ScolyProvider, useScoly } from "@/lib/store";
import { Payment, Student } from "@/types/scoly";
import { ImportSourceType } from "@/types/import";
import { BrowserNotificationBanner } from "@/components/notifications/BrowserNotificationBanner";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { TrialCountdownBanner } from "@/components/subscription/TrialCountdownBanner";
import { TrialExpiredModal } from "@/components/subscription/TrialExpiredModal";
import { ProFeatureModal } from "@/components/subscription/ProFeatureModal";
import { FeatureKey } from "@/types/subscription";

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
  openProModal: (featureKey?: FeatureKey, customTitle?: string, customDescription?: string) => void;
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
  const router = useRouter();
  const { payments, currentUser, isLoaded } = useScoly();

  // Route protection: redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.replace("/login");
    }
  }, [isLoaded, currentUser, router]);

  // Synchronous protection: NEVER render dashboard shell while loading or unauthenticated
  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          <span>Chargement de votre espace...</span>
        </div>
      </div>
    );
  }

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

  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proModalFeatureKey, setProModalFeatureKey] = useState<FeatureKey | null>(null);
  const [proModalTitle, setProModalTitle] = useState<string | undefined>();
  const [proModalDesc, setProModalDesc] = useState<string | undefined>();

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

  const openProModal = (featureKey?: FeatureKey, customTitle?: string, customDescription?: string) => {
    setProModalFeatureKey(featureKey || null);
    setProModalTitle(customTitle);
    setProModalDesc(customDescription);
    setIsProModalOpen(true);
  };

  return (
    <GlobalModalContext.Provider
      value={{
        openPaymentModal,
        openReceiptModal,
        openStudentModal,
        openReminderModal,
        openImportModal,
        openProModal,
      }}
    >
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
        {/* Persistent Sidebar on Desktop/Tablet */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Trial countdown reminder banner */}
          <TrialCountdownBanner />

          {/* Browser notification permission banner */}
          <BrowserNotificationBanner />

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

        {/* Floating Intelligent Notification Toast */}
        <NotificationToast />

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

        {/* SCOLY PRO Discovery / Upgrade Modal */}
        <ProFeatureModal
          isOpen={isProModalOpen}
          featureKey={proModalFeatureKey}
          customTitle={proModalTitle}
          customDescription={proModalDesc}
          onClose={() => {
            setIsProModalOpen(false);
            setProModalFeatureKey(null);
            setProModalTitle(undefined);
            setProModalDesc(undefined);
          }}
        />

        {/* Paywall Modal upon 15-day Trial Expiration */}
        <TrialExpiredModal />
      </div>
    </GlobalModalContext.Provider>
  );

}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShellContent>{children}</DashboardShellContent>;
}
