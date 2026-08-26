"use client";

import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
          <div className="h-10 w-40 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 h-36 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-36 bg-slate-200 rounded-md" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Center Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 h-48 space-y-4">
        <div className="h-5 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Chart & Donut Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 h-72" />
        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-72" />
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-64" />
        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-64" />
      </div>
    </div>
  );
}
