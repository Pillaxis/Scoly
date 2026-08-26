"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Copy, Check, Smartphone } from "lucide-react";
import { Student } from "@/types/scoly";
import { useScoly } from "@/lib/store";
import { formatFCFA, generateReminderTemplate, generateWhatsAppLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { SmsIcon } from "@/components/icons/SmsIcon";

interface ReminderModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialChannel?: "whatsapp" | "sms";
}

export function ReminderModal({
  student,
  isOpen,
  onClose,
  onSuccess,
  initialChannel = "whatsapp",
}: ReminderModalProps) {
  const { school, getStudentFinancialSummary, recordReminder } = useScoly();
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "sms">(initialChannel);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialChannel) {
      setSelectedChannel(initialChannel);
    }
  }, [initialChannel, isOpen]);

  useEffect(() => {
    if (student) {
      const summary = getStudentFinancialSummary(student.id);
      const template = generateReminderTemplate({
        parentName: student.parent.full_name,
        studentName: `${student.first_name} ${student.last_name}`,
        className: student.class_name,
        schoolName: school.name || "l'Établissement",
        amountDue: summary.balance_due,
        daysLate: summary.days_late,
        dueDate: summary.next_due_date,
      });
      setMessage(template);
    }
  }, [student, school, getStudentFinancialSummary, isOpen]);

  if (!isOpen || !student) return null;

  const summary = getStudentFinancialSummary(student.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    recordReminder({
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      parent_name: student.parent.full_name,
      parent_phone: student.parent.phone_primary,
      channel: "whatsapp",
      message_content: message,
      amount_due: summary.balance_due,
      days_late: summary.days_late,
      status: "sent",
    });

    const url = generateWhatsAppLink(student.parent.phone_primary, message);
    window.open(url, "_blank");

    if (onSuccess) onSuccess();
    onClose();
  };

  const handleSendSMS = () => {
    recordReminder({
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      parent_name: student.parent.full_name,
      parent_phone: student.parent.phone_primary,
      channel: "sms",
      message_content: message,
      amount_due: summary.balance_due,
      days_late: summary.days_late,
      status: "sent",
    });

    // Native SMS intent
    const cleanPhone = student.parent.phone_primary.replace(/[^0-9+]/g, "");
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] pb-[env(safe-area-inset-bottom,16px)] sm:pb-0">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                selectedChannel === "whatsapp"
                  ? "bg-[#25D366]/15 text-[#128C7E]"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {selectedChannel === "whatsapp" ? (
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              ) : (
                <SmsIcon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                {selectedChannel === "whatsapp" ? "Relance WhatsApp" : "Relance Message Simple (SMS)"}
              </h2>
              <p className="text-xs text-slate-500">
                {student.first_name} {student.last_name} ({student.class_name}) • Reste :{" "}
                <strong className="text-rose-600 font-mono">{formatFCFA(summary.balance_due)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center px-6 pt-4 gap-2">
          <button
            type="button"
            onClick={() => setSelectedChannel("whatsapp")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedChannel === "whatsapp"
                ? "bg-[#25D366]/10 text-[#075E54] border-[#25D366] shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedChannel("sms")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedChannel === "sms"
                ? "bg-blue-50 text-blue-800 border-blue-500 shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <SmsIcon className="w-4 h-4 text-blue-600" />
            <span>Message Simple (SMS)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Recipient info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Parent destinataire : </span>
              <strong className="text-slate-900">
                {student.parent.full_name} ({student.parent.relationship})
              </strong>
            </div>
            <div className="font-mono text-slate-800 font-bold">
              {student.parent.phone_primary}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Contenu du message (modifiable) :
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copié !" : "Copier le texte"}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            {selectedChannel === "whatsapp"
              ? "💡 L'application WhatsApp s'ouvrira avec ce message pré-rempli et la relance sera inscrite dans le journal d'activité."
              : "💡 Le message sera prêt à être envoyé par SMS direct sur le numéro du parent."}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>

          {selectedChannel === "whatsapp" ? (
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#25D366]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Ouvrir WhatsApp & Enregistrer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendSMS}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <SmsIcon className="w-4 h-4 text-white" />
              <span>Envoyer par SMS (Message)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
