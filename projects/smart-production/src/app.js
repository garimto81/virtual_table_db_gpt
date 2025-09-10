import React from "react";
import { ArrowRight, Battery, Monitor, Camera, Info, BadgeCheck } from "lucide-react";

/**
 * v0.5 — 직관 강화 전용 뷰
 * 요구 반영:
 *  - V마운트 배터리: 최초(한국4/키프로스8) → 이동(키프로스→한국4, 키프로스→프라하4) → 최종(한국8/프라하4)
 *  - TVLogic 24" 모니터: 한국 → 키프로스 → (프로덕션 종료) → 프라하
 *  - 16–35mm 렌즈: 프라하 -까르네-> 키프로스 -까르네-> 프라하 (ATA Carnet 회송)
 *  - UPS/스페어/패킹 템플릿 제거
 *  - 약어 최초 등장 시 영어 풀네임 + 한국어 설명 병기
 */

// ───────────────── Data
const BATTERY = {
  initial: { KR: 4, CYP: 8, PRG: 0 },
  moves: { CYP_to_KR: 4, CYP_to_PRG: 4 },
  final: { KR: 8, CYP: 0, PRG: 4 },
};

const RouteMonitor = [
  { from: "한국", to: "키프로스", label: "TVLogic 24\" 모니터 ×1" },
  { from: "키프로스", to: "프라하", label: "프로덕션 종료 후 이동" },
];

const RouteLens = [
  { from: "프라하", to: "키프로스", label: "16–35mm 렌즈 ×1", carnet: true },
  { from: "키프로스", to: "프라하", label: "복귀", carnet: true },
];

// ──────────────── UI Helpers
function Pill({ children, tone = "note" }) {
  const map = {
    note: "bg-slate-50 text-slate-700 border-slate-200",
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

function DotRow({ count = 0, max = 10, size = 10, filledTone = "bg-emerald-500 border-emerald-500", emptyTone = "bg-white border-slate-300" }) {
  const cells = Array.from({ length: Math.min(max, Math.max(count, max)) });
  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((_, i) => (
        <span key={i} className={`h-[${size}px] w-[${size}px] rounded-[4px] border ${i < count ? filledTone : emptyTone}`} />
      ))}
    </div>
  );
}

function LocationCard({ title, count, icon: Icon = Battery, tone = "note" }) {
  const ring = tone === "ok" ? "ring-emerald-200" : tone === "info" ? "ring-sky-200" : "ring-slate-200";
  return (
    <div className={`rounded-2xl bg-white border border-slate-200 ring-1 ${ring} p-4 shadow-sm`}>      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        </div>
        <Pill tone={tone === "ok" ? "ok" : "note"}>×{count}</Pill>
      </div>
      <div className="mt-2"><DotRow count={count} max={10} /></div>
    </div>
  );
}

function SplitFlow({ fromLabel, leftTo, rightTo }) {
  // leftTo: { label, count }
  // rightTo: { label, count }
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700 mb-2">{fromLabel} 분배 흐름</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[leftTo, rightTo].map((to, idx) => (
          <div key={idx} className="rounded-xl bg-white border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50">{fromLabel}</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50">{to.label}</span>
              <Pill tone="ok">×{to.count}</Pill>
            </div>
            <div className="mt-2"><DotRow count={to.count} max={10} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinearFlow({ title, steps }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3">{title}</div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm">
              <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50">{s.from}</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50">{s.to}</span>
              {s.carnet && <Pill tone="info">ATA Carnet(=일시 통관)</Pill>}
              {s.label && <Pill tone="note">{s.label}</Pill>}
            </div>
            {i < steps.length - 1 && <div className="hidden md:block text-slate-400">→</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
export default function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-slate-900 text-slate-50 p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">물류 시각화 v0.5 — 배터리·모니터·렌즈 동선</h1>
              <p className="text-slate-300 mt-1">최대한 단순한 레이아웃으로 핵심 이동만 강조</p>
            </div>
            <Pill tone="ok"><BadgeCheck className="h-3.5 w-3.5" /> 직관 강화 뷰</Pill>
          </div>
        </header>

        {/* Section 1: V-Mount Battery */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">① V마운트 배터리(=V-mount Battery) 배치</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">최초</h3>
              <LocationCard title="한국" count={BATTERY.initial.KR} />
              <LocationCard title="키프로스" count={BATTERY.initial.CYP} />
              <LocationCard title="프라하" count={BATTERY.initial.PRG} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">이동</h3>
              <SplitFlow
                fromLabel="키프로스"
                leftTo={{ label: "한국", count: BATTERY.moves.CYP_to_KR }}
                rightTo={{ label: "프라하", count: BATTERY.moves.CYP_to_PRG }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">최종</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LocationCard title="한국" count={BATTERY.final.KR} tone="ok" />
              <LocationCard title="프라하" count={BATTERY.final.PRG} tone="ok" />
              <LocationCard title="키프로스" count={BATTERY.final.CYP} />
            </div>
          </div>
        </section>

        {/* Section 2: TVLogic 24" Monitor */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">② TVLogic 24" 모니터 이동</h2>
          </div>
          <LinearFlow
            title="한국 → 키프로스 → (프로덕션 종료) → 프라하"
            steps={RouteMonitor}
          />
        </section>

        {/* Section 3: 16–35mm Lens (Carnet) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">③ 16–35mm 렌즈(=16–35mm Lens) 까르네(=ATA Carnet, 일시 통관) 회송</h2>
          </div>
          <LinearFlow
            title="프라하 -까르네-> 키프로스 -까르네-> 프라하"
            steps={RouteLens}
          />
        </section>

        {/* Legend */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2 text-slate-800 mb-2"><Info className="h-4 w-4" /> 범례</div>
          <p className="mb-1">• <strong>ATA Carnet</strong> = 일시 통관증명서(해외 임시 반출입)</p>
          <p className="mb-1">• 약어는 최초 등장 시 영어 풀네임과 한국어 설명을 병기합니다.</p>
        </section>

        <footer className="text-xs text-slate-500 text-center pb-4">업데이트: 2025-08-13</footer>
      </div>
    </div>
  );
}
