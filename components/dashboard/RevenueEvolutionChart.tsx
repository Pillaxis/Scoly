"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Calendar, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA } from "@/lib/utils";

type PeriodFilter = "monthly" | "quarterly" | "yearly";

interface ChartDataPoint {
  key: string;
  label: string;
  shortLabel: string;
  collected: number;
  unpaid: number;
  isCurrent?: boolean;
}

export function RevenueEvolutionChart() {
  const { payments, students, tuitionPlans, academicYear } = useScoly();
  const [period, setPeriod] = useState<PeriodFilter>("monthly");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Current month key (e.g. "08" for August)
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return String(d.getMonth() + 1).padStart(2, "0");
  }, []);

  // Compute academic year months and data
  const chartData = useMemo((): ChartDataPoint[] => {
    const activePayments = payments.filter((p) => p.status !== "cancelled");

    // Standard complete 12-month academic cycle (Septembre -> Août)
    const schoolMonths = [
      { key: "09", name: "Septembre", short: "Sept." },
      { key: "10", name: "Octobre", short: "Oct." },
      { key: "11", name: "Novembre", short: "Nov." },
      { key: "12", name: "Décembre", short: "Déc." },
      { key: "01", name: "Janvier", short: "Janv." },
      { key: "02", name: "Février", short: "Fév." },
      { key: "03", name: "Mars", short: "Mars" },
      { key: "04", name: "Avril", short: "Avr." },
      { key: "05", name: "Mai", short: "Mai" },
      { key: "06", name: "Juin", short: "Juin" },
      { key: "07", name: "Juillet", short: "Juil." },
      { key: "08", name: "Août", short: "Août" },
    ];

    if (period === "monthly") {
      return schoolMonths.map((m) => {
        const isCurrent = m.key === currentMonthKey;

        // Payments collected in this month
        const collected = activePayments
          .filter((p) => {
            if (!p.payment_date) return false;
            const parts = p.payment_date.split("-");
            return parts.length >= 2 && parts[1] === m.key;
          })
          .reduce((sum, p) => sum + Math.round(p.amount), 0);

        // Due installments in this month across enrolled students
        let expectedMonth = 0;
        students.forEach((student) => {
          const plan = tuitionPlans.find((tp) => tp.class_id === student.class_id);
          if (plan) {
            plan.installments.forEach((inst) => {
              if (inst.due_date) {
                const parts = inst.due_date.split("-");
                if (parts.length >= 2 && parts[1] === m.key) {
                  expectedMonth += Math.round(inst.amount);
                }
              }
            });
          }
        });

        const unpaid = Math.max(0, expectedMonth - collected);

        return {
          key: m.key,
          label: isCurrent ? `${m.name} (En cours)` : m.name,
          shortLabel: m.short,
          collected,
          unpaid,
          isCurrent,
        };
      });
    }

    if (period === "quarterly") {
      const quarters = [
        { key: "T1", label: "1er Trimestre (Sept - Nov)", shortLabel: "Trim. 1", months: ["09", "10", "11"] },
        { key: "T2", label: "2ème Trimestre (Déc - Fév)", shortLabel: "Trim. 2", months: ["12", "01", "02"] },
        { key: "T3", label: "3ème Trimestre (Mars - Mai)", shortLabel: "Trim. 3", months: ["03", "04", "05"] },
        { key: "T4", label: "Clôture & Vacances (Juin - Août)", shortLabel: "Clôture", months: ["06", "07", "08"] },
      ];

      return quarters.map((q) => {
        const isCurrent = q.months.includes(currentMonthKey);
        const collected = activePayments
          .filter((p) => {
            if (!p.payment_date) return false;
            const parts = p.payment_date.split("-");
            return parts.length >= 2 && q.months.includes(parts[1]);
          })
          .reduce((sum, p) => sum + Math.round(p.amount), 0);

        let expectedQuarter = 0;
        students.forEach((student) => {
          const plan = tuitionPlans.find((tp) => tp.class_id === student.class_id);
          if (plan) {
            plan.installments.forEach((inst) => {
              if (inst.due_date) {
                const parts = inst.due_date.split("-");
                if (parts.length >= 2 && q.months.includes(parts[1])) {
                  expectedQuarter += Math.round(inst.amount);
                }
              }
            });
          }
        });

        const unpaid = Math.max(0, expectedQuarter - collected);

        return {
          key: q.key,
          label: isCurrent ? `${q.label} (En cours)` : q.label,
          shortLabel: q.shortLabel,
          collected,
          unpaid,
          isCurrent,
        };
      });
    }

    // Yearly
    const totalCollected = activePayments.reduce((sum, p) => sum + Math.round(p.amount), 0);
    let totalExpected = 0;
    students.forEach((student) => {
      const plan = tuitionPlans.find((tp) => tp.class_id === student.class_id);
      if (plan) {
        totalExpected += Math.round(plan.total_amount);
      }
    });

    const totalUnpaid = Math.max(0, totalExpected - totalCollected);

    return [
      {
        key: "annual",
        label: `Année Scolaire ${academicYear.name}`,
        shortLabel: academicYear.name,
        collected: totalCollected,
        unpaid: totalUnpaid,
        isCurrent: true,
      },
    ];
  }, [payments, students, tuitionPlans, academicYear, period, currentMonthKey]);

  // Max value for scaling
  const maxVal = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      if (d.collected > max) max = d.collected;
      if (d.unpaid > max) max = d.unpaid;
    });
    return max > 0 ? max * 1.15 : 100000;
  }, [chartData]);

  // Overall totals for summary header
  const totals = useMemo(() => {
    const totalCollected = chartData.reduce((sum, d) => sum + d.collected, 0);
    const totalUnpaid = chartData.reduce((sum, d) => sum + d.unpaid, 0);
    return { totalCollected, totalUnpaid };
  }, [chartData]);

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  // Compute point coordinates
  const pointsCollected = useMemo(() => {
    if (chartData.length === 1) {
      const x = paddingLeft + innerWidth / 2;
      const y = paddingTop + innerHeight - (chartData[0].collected / maxVal) * innerHeight;
      return [{ x, y, data: chartData[0] }];
    }
    return chartData.map((d, index) => {
      const x = paddingLeft + (index / (chartData.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - (d.collected / maxVal) * innerHeight;
      return { x, y, data: d };
    });
  }, [chartData, maxVal, innerWidth, innerHeight, paddingLeft, paddingTop]);

  const pointsUnpaid = useMemo(() => {
    if (chartData.length === 1) {
      const x = paddingLeft + innerWidth / 2;
      const y = paddingTop + innerHeight - (chartData[0].unpaid / maxVal) * innerHeight;
      return [{ x, y, data: chartData[0] }];
    }
    return chartData.map((d, index) => {
      const x = paddingLeft + (index / (chartData.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - (d.unpaid / maxVal) * innerHeight;
      return { x, y, data: d };
    });
  }, [chartData, maxVal, innerWidth, innerHeight, paddingLeft, paddingTop]);

  // Smooth bezier curve generator
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePathCollected = useMemo(() => createSmoothPath(pointsCollected), [pointsCollected]);
  const linePathUnpaid = useMemo(() => createSmoothPath(pointsUnpaid), [pointsUnpaid]);

  // Area path for gradient background
  const areaPathCollected = useMemo(() => {
    if (pointsCollected.length <= 1) return "";
    const bottomY = paddingTop + innerHeight;
    const firstX = pointsCollected[0].x;
    const lastX = pointsCollected[pointsCollected.length - 1].x;
    return `${linePathCollected} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePathCollected, pointsCollected, paddingTop, innerHeight]);

  const activePoint = hoveredIndex !== null && chartData[hoveredIndex] ? chartData[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between h-full">
      {/* Header with Title & Period Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Évolution des Encaissements & Impayés
              </h3>
              <p className="text-xs text-slate-400">
                Suivi dynamique de la trésorerie et des échéances
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setPeriod("monthly");
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              period === "monthly"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Mensuel
          </button>

          <button
            type="button"
            onClick={() => {
              setPeriod("quarterly");
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              period === "quarterly"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Trimestriel
          </button>

          <button
            type="button"
            onClick={() => {
              setPeriod("yearly");
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              period === "yearly"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Annuel
          </button>
        </div>
      </div>

      {/* Legend & Summary Values - Fixed height to avoid any layout shifts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 pb-1 text-xs min-h-[36px]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-2xs" />
            <span className="font-bold text-slate-700">Encaissements :</span>
            <span className="font-mono font-black text-blue-700">
              {formatFCFA(totals.totalCollected)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-2xs" />
            <span className="font-bold text-slate-700">Impayés :</span>
            <span className="font-mono font-black text-rose-600">
              {formatFCFA(totals.totalUnpaid)}
            </span>
          </div>
        </div>

        {/* Stable reserved slot for active point info without pushing layout */}
        <div className="h-6 flex items-center shrink-0">
          <div
            className={`px-2.5 py-0.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-2 transition-opacity duration-150 ${
              activePoint ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span>{activePoint ? activePoint.label : "—"}</span>
            <span className="text-blue-300 font-mono">
              +{formatFCFA(activePoint ? activePoint.collected : 0)}
            </span>
            <span className="text-rose-300 font-mono">
              / {formatFCFA(activePoint ? activePoint.unpaid : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Curve Chart */}
      <div className="relative mt-2 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-56 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Gradient for Collected */}
            <linearGradient id="gradient-collected" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient for Unpaid */}
            <linearGradient id="gradient-unpaid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const val = maxVal * ratio;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono font-medium"
                >
                  {val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${Math.round(val / 1000)}k`
                    : "0"}
                </text>
              </g>
            );
          })}

          {/* Collected Gradient Area */}
          {areaPathCollected && (
            <path d={areaPathCollected} fill="url(#gradient-collected)" />
          )}

          {/* Unpaid Line Curve */}
          {linePathUnpaid && (
            <path
              d={linePathUnpaid}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Collected Line Curve */}
          {linePathCollected && (
            <path
              d={linePathCollected}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover highlight line */}
          {hoveredIndex !== null && pointsCollected[hoveredIndex] && (
            <line
              x1={pointsCollected[hoveredIndex].x}
              y1={paddingTop}
              x2={pointsCollected[hoveredIndex].x}
              y2={paddingTop + innerHeight}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="pointer-events-none"
            />
          )}

          {/* Subtle guide line for current month */}
          {period === "monthly" &&
            pointsCollected.map((pt, i) => {
              if (!pt.data.isCurrent) return null;
              return (
                <line
                  key={`guide-${i}`}
                  x1={pt.x}
                  y1={paddingTop}
                  x2={pt.x}
                  y2={paddingTop + innerHeight}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.3"
                  className="pointer-events-none"
                />
              );
            })}

          {/* Points & Hover Target Areas */}
          {pointsCollected.map((pt, index) => {
            const isHovered = hoveredIndex === index;
            const ptUnpaid = pointsUnpaid[index];
            const isCurrent = Boolean(pt.data.isCurrent);

            // Compute contiguous hitboxes without gaps
            const totalPoints = chartData.length;
            let rectX = paddingLeft;
            let rectWidth = innerWidth;

            if (totalPoints > 1) {
              const prevX = index > 0 ? (pointsCollected[index - 1].x + pt.x) / 2 : 0;
              const nextX =
                index < totalPoints - 1 ? (pt.x + pointsCollected[index + 1].x) / 2 : svgWidth;
              rectX = prevX;
              rectWidth = nextX - prevX;
            } else {
              rectX = 0;
              rectWidth = svgWidth;
            }

            return (
              <g key={index}>
                {/* Subtle halo ring for current month point */}
                {isCurrent && !isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="7.5"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.45"
                    className="pointer-events-none"
                  />
                )}

                {/* Collected Point Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "5.5" : isCurrent ? "4" : "3.5"}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? "2.5" : isCurrent ? "2.5" : "2"}
                  className="transition-all duration-100"
                />

                {/* Unpaid Point Circle */}
                {ptUnpaid && (
                  <circle
                    cx={ptUnpaid.x}
                    cy={ptUnpaid.y}
                    r={isHovered ? "4.5" : "2.5"}
                    fill="#ffffff"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    className="transition-all duration-100"
                  />
                )}

                {/* Discreet highlight pill for current month label */}
                {isCurrent && (
                  <rect
                    x={pt.x - 17}
                    y={paddingTop + innerHeight + 6}
                    width="34"
                    height="16"
                    rx="8"
                    fill="#eff6ff"
                    stroke="#bfdbfe"
                    strokeWidth="1"
                  />
                )}

                {/* X Axis Labels */}
                <text
                  x={pt.x}
                  y={paddingTop + innerHeight + 17.5}
                  textAnchor="middle"
                  className={`text-[9.5px] select-none transition-colors duration-100 ${
                    isHovered
                      ? "fill-blue-700 font-extrabold"
                      : isCurrent
                      ? "fill-blue-700 font-bold"
                      : "fill-slate-400 font-medium"
                  }`}
                >
                  {pt.data.shortLabel}
                </text>

                {/* Tiny discreet dot under current month */}
                {isCurrent && (
                  <circle
                    cx={pt.x}
                    cy={paddingTop + innerHeight + 26}
                    r="1.5"
                    fill="#2563eb"
                  />
                )}

                {/* Seamless Hover hitbox */}
                <rect
                  x={rectX}
                  y={0}
                  width={rectWidth}
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Floating Card */}
        {hoveredIndex !== null && pointsCollected[hoveredIndex] && (
          <div
            className="absolute top-2 z-10 pointer-events-none bg-slate-900/95 text-white p-2.5 px-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-xs border border-slate-700 min-w-[160px] transition-[left] duration-100 ease-out"
            style={{
              left: `${Math.min(
                Math.max(14, (pointsCollected[hoveredIndex].x / svgWidth) * 100),
                86
              )}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-extrabold text-slate-200 border-b border-slate-700/80 pb-1 text-[11px]">
              {chartData[hoveredIndex].label}
            </p>
            <div className="flex items-center justify-between text-blue-300 pt-0.5 text-[11px]">
              <span>Encaissements :</span>
              <strong className="font-mono font-bold">
                {formatFCFA(chartData[hoveredIndex].collected)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-rose-300 text-[11px]">
              <span>Impayés :</span>
              <strong className="font-mono font-bold">
                {formatFCFA(chartData[hoveredIndex].unpaid)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
