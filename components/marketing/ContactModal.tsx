"use client";

import React from "react";
import { X, Phone, Mail, MessageSquare, ArrowUpRight } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-left">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Contactez l&apos;équipe SCOLY
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            Une question sur la plateforme ou besoin d&apos;une démonstration personnalisée ? Nous sommes à votre écoute.
          </p>
        </div>

        {/* Contact Action Cards */}
        <div className="mt-6 space-y-3">
          {/* 1. WhatsApp Action */}
          <a
            href="https://wa.me/22892880010?text=Bonjour%20SCOLY%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20la%20solution."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-900">Discuter sur WhatsApp</p>
                <p className="text-sm font-black text-slate-900 font-mono">+228 92 88 00 10</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          {/* 2. Direct Phone Call */}
          <a
            href="tel:+22892880010"
            className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-blue-900">Appel téléphonique direct</p>
                <p className="text-sm font-black text-slate-900 font-mono">+228 92 88 00 10</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          {/* 3. Email Support */}
          <a
            href="mailto:nasserpillar4@gmail.com"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-700">Par courrier électronique</p>
                <p className="text-xs sm:text-sm font-black text-slate-900 truncate">nasserpillar4@gmail.com</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
          Assistance disponible du Lundi au Samedi (8h00 - 18h00 GMT)
        </div>
      </div>
    </div>
  );
}
