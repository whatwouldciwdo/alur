"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, Search, Filter, Shield, Edit3, KeyRound,
  CheckCircle, X, RefreshCw, ChevronDown, Save,
  Mail, Phone, Building2, UserCog, AlertTriangle, UserPlus, Eye, EyeOff,
  Moon, Sun, Info, AlertCircle,
} from "lucide-react";

interface UserRow {
  id: string;
  nip: string;
  nama: string;
  jenjangJabatan: string;
  bidang: string;
  subBidang: string;
  role: string;
  emailPerusahaan: string;
  emailPersonal: string | null;
  phone: string | null;
  tlGroup: string | null;
  tipeKerja: "SHIFT" | "NON_SHIFT";
  createdAt: string;
  _count: { lemburs: number };
}

const ROLE_OPTIONS = [
  { value: "", label: "Semua Role" },
  { value: "PEGAWAI", label: "Pegawai" },
  { value: "OFFICER", label: "Officer" },
  { value: "TL", label: "TL" },
  { value: "ASMAN", label: "Asman" },
  { value: "MANAGER", label: "Manager" },
  { value: "BRANCH_MANAGER", label: "Branch Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const BIDANG_OPTIONS = [
  { value: "", label: "Semua Bidang" },
  { value: "OPERASI", label: "Operasi" },
  { value: "SDM_KEU", label: "SDM & Keuangan" },
  { value: "PEMELIHARAAN", label: "Pemeliharaan" },
  { value: "ENGINEERING", label: "Engineering" },
];

const SUB_BIDANG_BY_BIDANG: Record<string, { value: string; label: string }[]> = {
  OPERASI: [
    { value: "KEPMO",          label: "Kepmo" },
    { value: "LINGKUNGAN",     label: "Lingkungan" },
    { value: "K3",             label: "K3" },
    { value: "OPERATOR_SHIFT", label: "Operator Shift" },
    { value: "OPERATOR_NIAGA", label: "Operator Niaga" },
  ],
  SDM_KEU: [
    { value: "SDM",      label: "SDM" },
    { value: "UMUM",     label: "Umum" },
    { value: "KEUANGAN", label: "Keuangan" },
    { value: "PBJ",      label: "PBJ" },
  ],
  PEMELIHARAAN: [
    { value: "LISTRIK", label: "Listrik" },
    { value: "IC",      label: "I&C" },
    { value: "MEKANIK", label: "Mekanik" },
    { value: "BOP",     label: "BOP" },
  ],
  ENGINEERING: [
    { value: "PDM",              label: "PDM" },
    { value: "ADMIN_SEKRETARIS", label: "Admin & Sekretaris" },
  ],
  "": [
    { value: "KEPMO", label: "Kepmo" }, { value: "LINGKUNGAN", label: "Lingkungan" },
    { value: "K3", label: "K3" }, { value: "OPERATOR_SHIFT", label: "Operator Shift" },
    { value: "OPERATOR_NIAGA", label: "Operator Niaga" }, { value: "SDM", label: "SDM" },
    { value: "UMUM", label: "Umum" }, { value: "KEUANGAN", label: "Keuangan" },
    { value: "PBJ", label: "PBJ" }, { value: "LISTRIK", label: "Listrik" },
    { value: "IC", label: "I&C" }, { value: "MEKANIK", label: "Mekanik" },
    { value: "BOP", label: "BOP" }, { value: "PDM", label: "PDM" },
    { value: "ADMIN_SEKRETARIS", label: "Admin & Sekretaris" },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:    "bg-purple-100 text-purple-800 border-purple-300",
  ADMIN:          "bg-primary-container text-on-primary border-primary/40",
  BRANCH_MANAGER: "bg-blue-100 text-blue-800 border-blue-300",
  MANAGER:        "bg-sky-100 text-sky-800 border-sky-300",
  ASMAN:          "bg-teal-100 text-teal-800 border-teal-300",
  TL:             "bg-emerald-100 text-emerald-800 border-emerald-300",
  OFFICER:        "bg-amber-100 text-amber-800 border-amber-300",
  PEGAWAI:        "bg-surface-variant text-on-surface border-on-background/30",
};

const inputCls = "bg-surface-variant border-2 border-on-background rounded-xl px-3 py-2.5 text-sm font-body-md focus:outline-none focus:border-primary transition-colors w-full";
const labelCls = "font-label-bold text-xs uppercase text-on-surface-variant mb-1 block";
const sectionTitle = "font-label-bold text-xs uppercase text-primary mb-3 flex items-center gap-1.5";

// ─── Shift/Non-Shift badge ───
// Gunakan field tipeKerja dari database (bukan hanya subBidang)
function isShift(user: UserRow) {
  return user.tipeKerja === "SHIFT";
}

function ShiftBadge({ user }: { user: UserRow }) {
  if (isShift(user)) {
    return (
      <span className="inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-300">
        <Moon size={11} /> SHIFT
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-300">
      <Sun size={11} /> NON-SHIFT
    </span>
  );
}

// ─── Account completeness ───
type CompletenessResult = {
  score: number;       // 0–100
  missing: string[];   // daftar field yang kosong
};

function checkCompleteness(u: UserRow): CompletenessResult {
  const fields: { label: string; ok: boolean }[] = [
    { label: "Email Personal", ok: !!u.emailPersonal },
    { label: "No. HP",        ok: !!u.phone },
    { label: "TL Group",      ok: isShift(u) ? !!u.tlGroup : true },
  ];
  const missing = fields.filter(f => !f.ok).map(f => f.label);
  const score   = Math.round(((fields.length - missing.length) / fields.length) * 100);
  return { score, missing };
}

function CompletenessBadge({ user }: { user: UserRow }) {
  const { score, missing } = checkCompleteness(user);
  if (score === 100) {
    return (
      <span className="inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
        <CheckCircle size={11} /> Lengkap
      </span>
    );
  }
  const label = missing.length === 1 ? `Kurang: ${missing[0]}` : `Kurang ${missing.length} data`;
  return (
    <span
      title={`Belum diisi: ${missing.join(", ")}`}
      className="inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-300 cursor-help"
    >
      <AlertCircle size={11} /> {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] ?? ROLE_COLORS.PEGAWAI;
  const label = ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
  return (
    <span className={`inline-flex items-center gap-1 font-label-bold text-xs px-2.5 py-1 rounded-full border ${c}`}>
      <Shield size={11} />{label}
    </span>
  );
}

function StatCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border-2 border-on-background rounded-2xl p-4 hard-shadow flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl border-2 border-on-background flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="font-label-bold text-xs uppercase text-on-surface-variant">{label}</p>
        <p className="font-bold text-xl text-on-background leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-on-background hard-shadow font-label-bold text-sm ${type === "success" ? "bg-primary-container text-on-primary" : "bg-error-container text-on-error-container"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      {msg}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function EditModal({ user, onClose, onSaved }: {
  user: UserRow; onClose: () => void; onSaved: (u: UserRow) => void;
}) {
  const [form, setForm] = useState({
    nama: user.nama, nip: user.nip, jenjangJabatan: user.jenjangJabatan,
    bidang: user.bidang, subBidang: user.subBidang, role: user.role,
    emailPerusahaan: user.emailPerusahaan, emailPersonal: user.emailPersonal ?? "",
    phone: user.phone ?? "", tlGroup: user.tlGroup ?? "", newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleBidangChange(v: string) {
    const firstSub = SUB_BIDANG_BY_BIDANG[v]?.[0]?.value ?? form.subBidang;
    setForm(f => ({ ...f, bidang: v, subBidang: firstSub }));
  }

  const subOpts = SUB_BIDANG_BY_BIDANG[form.bidang] ?? SUB_BIDANG_BY_BIDANG[""];

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const body: Record<string, string> = {
        nama: form.nama, nip: form.nip, jenjangJabatan: form.jenjangJabatan,
        bidang: form.bidang, subBidang: form.subBidang, role: form.role,
        emailPerusahaan: form.emailPerusahaan,
      };
      if (form.emailPersonal) body.emailPersonal = form.emailPersonal;
      if (form.phone)         body.phone         = form.phone;
      if (form.tlGroup)       body.tlGroup       = form.tlGroup;
      if (form.newPassword)   body.newPassword   = form.newPassword;
      const res = await fetch(`/api/superadmin/users/${user.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menyimpan."); return; }
      onSaved({ ...user, ...data });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-container-lowest border-2 border-on-background rounded-[2rem] hard-shadow w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b-2 border-on-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container border-2 border-on-background flex items-center justify-center"><Edit3 size={18} className="text-on-primary" /></div>
            <div><h2 className="font-bold text-base uppercase">Edit User</h2><p className="text-xs text-on-surface-variant">{user.nip} — {user.nama}</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-variant border-2 border-transparent hover:border-on-background transition-all"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-6 flex flex-col gap-5">
          {/* Identitas */}
          <div>
            <p className={sectionTitle}><UserCog size={13} />Identitas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Nama Lengkap</label><input className={inputCls} value={form.nama} onChange={e => set("nama", e.target.value)} /></div>
              <div><label className={labelCls}>NIP</label><input className={inputCls} value={form.nip} onChange={e => set("nip", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Jenjang Jabatan</label><input className={inputCls} value={form.jenjangJabatan} onChange={e => set("jenjangJabatan", e.target.value)} /></div>
            </div>
          </div>
          <hr className="border-on-background/20" />
          {/* Organisasi */}
          <div>
            <p className={sectionTitle}><Building2 size={13} />Organisasi</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Bidang</label>
                <select className={inputCls + " appearance-none cursor-pointer"} value={form.bidang} onChange={e => handleBidangChange(e.target.value)}>
                  {BIDANG_OPTIONS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sub Bidang</label>
                <select className={inputCls + " appearance-none cursor-pointer"} value={form.subBidang} onChange={e => set("subBidang", e.target.value)}>
                  {subOpts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>TL Group (opsional)</label><input className={inputCls} placeholder="A / B / C / D" value={form.tlGroup} onChange={e => set("tlGroup", e.target.value)} /></div>
            </div>
          </div>
          <hr className="border-on-background/20" />
          {/* Role */}
          <div>
            <p className={sectionTitle}><Shield size={13} />Role & Akses</p>
            <select className={inputCls + " appearance-none cursor-pointer"} value={form.role} onChange={e => set("role", e.target.value)}>
              {ROLE_OPTIONS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <hr className="border-on-background/20" />
          {/* Kontak */}
          <div>
            <p className={sectionTitle}><Mail size={13} />Kontak</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Email Perusahaan</label><input className={inputCls} type="email" value={form.emailPerusahaan} onChange={e => set("emailPerusahaan", e.target.value)} /></div>
              <div><label className={labelCls}>Email Personal (Gmail)</label><input className={inputCls} type="email" placeholder="contoh@gmail.com" value={form.emailPersonal} onChange={e => set("emailPersonal", e.target.value)} /></div>
              <div><label className={labelCls}><Phone size={11} className="inline mr-1" />No. HP</label><input className={inputCls} type="tel" placeholder="08xx..." value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
            </div>
          </div>
          <hr className="border-on-background/20" />
          {/* Password manual */}
          <div>
            <p className={sectionTitle}><KeyRound size={13} />Set Password Manual (opsional)</p>
            <input className={inputCls} type="password" placeholder="Kosongkan jika tidak diubah" value={form.newPassword} onChange={e => set("newPassword", e.target.value)} />
          </div>
          {error && <div className="flex items-center gap-2 bg-error-container text-on-error-container border border-on-background rounded-xl px-4 py-3 text-sm font-label-bold"><AlertTriangle size={15} />{error}</div>}
        </div>
        <div className="flex gap-3 p-6 border-t-2 border-on-background">
          <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-label-bold text-sm rounded-full py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50">
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
          </button>
          <button onClick={onClose} className="px-6 py-3 border-2 border-on-background rounded-full font-label-bold text-sm hover:bg-surface-variant transition-colors">BATAL</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  nama: "", nip: "", jenjangJabatan: "",
  bidang: "OPERASI", subBidang: "KEPMO",
  role: "PEGAWAI",
  emailPerusahaan: "", emailPersonal: "", phone: "", tlGroup: "",
  password: "", confirmPassword: "",
};

function AddUserModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: (u: UserRow) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleBidangChange(v: string) {
    const firstSub = SUB_BIDANG_BY_BIDANG[v]?.[0]?.value ?? "";
    setForm(f => ({ ...f, bidang: v, subBidang: firstSub }));
  }

  const subOpts = SUB_BIDANG_BY_BIDANG[form.bidang] ?? [];

  const pwMatch = form.password === form.confirmPassword;
  const pwStrong = form.password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwStrong) { setError("Password minimal 8 karakter."); return; }
    if (!pwMatch)  { setError("Password tidak cocok."); return; }
    setSaving(true); setError("");
    try {
      const body: Record<string, string> = {
        nip: form.nip, nama: form.nama, jenjangJabatan: form.jenjangJabatan,
        bidang: form.bidang, subBidang: form.subBidang, role: form.role,
        emailPerusahaan: form.emailPerusahaan, password: form.password,
      };
      if (form.emailPersonal) body.emailPersonal = form.emailPersonal;
      if (form.phone)         body.phone         = form.phone;
      if (form.tlGroup)       body.tlGroup       = form.tlGroup;
      const res = await fetch("/api/superadmin/users", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal membuat user."); return; }
      onCreated(data);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-container-lowest border-2 border-on-background rounded-[2rem] hard-shadow w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-on-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-on-background flex items-center justify-center">
              <UserPlus size={18} className="text-purple-700" />
            </div>
            <div>
              <h2 className="font-bold text-base uppercase">Tambah User Baru</h2>
              <p className="text-xs text-on-surface-variant">Akun baru akan langsung bisa login</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-variant border-2 border-transparent hover:border-on-background transition-all"><X size={18} /></button>
        </div>

        {/* Body */}
        <form id="add-user-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-5">

          {/* Identitas */}
          <div>
            <p className={sectionTitle}><UserCog size={13} />Identitas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nama Lengkap <span className="text-error">*</span></label>
                <input required className={inputCls} placeholder="Nama sesuai data kepegawaian" value={form.nama} onChange={e => set("nama", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>NIP <span className="text-error">*</span></label>
                <input required className={inputCls} placeholder="Nomor Induk Pegawai" value={form.nip} onChange={e => set("nip", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Jenjang Jabatan <span className="text-error">*</span></label>
                <input required className={inputCls} placeholder="Contoh: Pelaksana Senior, Asisten Manajer..." value={form.jenjangJabatan} onChange={e => set("jenjangJabatan", e.target.value)} />
              </div>
            </div>
          </div>

          <hr className="border-on-background/20" />

          {/* Organisasi + Role */}
          <div>
            <p className={sectionTitle}><Building2 size={13} />Organisasi & Role</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bidang — dropdown dengan icon */}
              <div>
                <label className={labelCls}>Bidang <span className="text-error">*</span></label>
                <div className="relative">
                  <select
                    required
                    className={inputCls + " appearance-none cursor-pointer pr-8"}
                    value={form.bidang}
                    onChange={e => handleBidangChange(e.target.value)}
                  >
                    {BIDANG_OPTIONS.filter(o => o.value).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Sub Bidang — filtered by bidang */}
              <div>
                <label className={labelCls}>Sub Bidang <span className="text-error">*</span></label>
                <div className="relative">
                  <select
                    required
                    className={inputCls + " appearance-none cursor-pointer pr-8"}
                    value={form.subBidang}
                    onChange={e => set("subBidang", e.target.value)}
                  >
                    {subOpts.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  ↳ Menentukan rantai approval lembur user ini
                </p>
              </div>

              {/* Role */}
              <div>
                <label className={labelCls}>Role Sistem <span className="text-error">*</span></label>
                <div className="relative">
                  <select
                    required
                    className={inputCls + " appearance-none cursor-pointer pr-8"}
                    value={form.role}
                    onChange={e => set("role", e.target.value)}
                  >
                    {ROLE_OPTIONS.filter(o => o.value).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* TL Group */}
              <div>
                <label className={labelCls}>TL Group <span className="text-on-surface-variant font-normal normal-case">(jika Operator Shift)</span></label>
                <input className={inputCls} placeholder="A / B / C / D" value={form.tlGroup} onChange={e => set("tlGroup", e.target.value)} />
              </div>
            </div>
          </div>

          <hr className="border-on-background/20" />

          {/* Kontak */}
          <div>
            <p className={sectionTitle}><Mail size={13} />Kontak</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email Perusahaan <span className="text-error">*</span></label>
                <input required type="email" className={inputCls} placeholder="nama@plnipservices.co.id" value={form.emailPerusahaan} onChange={e => set("emailPerusahaan", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email Personal (Gmail)</label>
                <input type="email" className={inputCls} placeholder="contoh@gmail.com" value={form.emailPersonal} onChange={e => set("emailPersonal", e.target.value)} />
                <p className="text-xs text-on-surface-variant mt-1">Untuk terima link reset password</p>
              </div>
              <div>
                <label className={labelCls}><Phone size={11} className="inline mr-1" />No. HP</label>
                <input type="tel" className={inputCls} placeholder="08xx..." value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
            </div>
          </div>

          <hr className="border-on-background/20" />

          {/* Password */}
          <div>
            <p className={sectionTitle}><KeyRound size={13} />Password Awal <span className="text-error">*</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPw ? "text" : "password"}
                    className={inputCls + " pr-11"}
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && !pwStrong && <p className="text-xs text-error mt-1 font-label-bold">Minimal 8 karakter.</p>}
              </div>
              <div>
                <label className={labelCls}>Konfirmasi Password</label>
                <input
                  required
                  type={showPw ? "text" : "password"}
                  className={`${inputCls} ${form.confirmPassword && !pwMatch ? "border-error" : ""}`}
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)}
                />
                {form.confirmPassword && !pwMatch && <p className="text-xs text-error mt-1 font-label-bold">Password tidak cocok.</p>}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container border border-on-background rounded-xl px-4 py-3 text-sm font-label-bold">
              <AlertTriangle size={15} />{error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-on-background">
          <button
            type="submit"
            form="add-user-form"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-700 text-white font-label-bold text-sm rounded-full py-3 border-2 border-on-background hard-shadow hard-shadow-hover hard-shadow-active transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {saving ? "MEMBUAT AKUN..." : "BUAT AKUN USER"}
          </button>
          <button onClick={onClose} className="px-6 py-3 border-2 border-on-background rounded-full font-label-bold text-sm hover:bg-surface-variant transition-colors">BATAL</button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [users, setUsers]             = useState<UserRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [bidang, setBidang]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("");
  const [shiftFilter, setShiftFilter] = useState<"" | "SHIFT" | "NON_SHIFT">("")
  const [completenessFilter, setCompletenessFilter] = useState<"" | "LENGKAP" | "TIDAK_LENGKAP">("")
  const [editUser, setEditUser]       = useState<UserRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [resetting, setResetting]     = useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/");
    if (sessionStatus === "authenticated" && session?.user?.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [sessionStatus, session, router]);

  const fetchUsers = useCallback(async (q = search, b = bidang, r = roleFilter) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q) p.set("search", q); if (b) p.set("bidang", b); if (r) p.set("role", r);
      const res = await fetch(`/api/superadmin/users?${p}`);
      setUsers(await res.json());
    } finally { setLoading(false); }
  }, [search, bidang, roleFilter]);

  useEffect(() => { fetchUsers(); }, [bidang, roleFilter]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchUsers(val, bidang, roleFilter), 400);
  }

  async function handleSendReset() {
    if (!resetTarget) return;
    setResetting(true);
    try {
      const res = await fetch("/api/superadmin/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetTarget.id }),
      });
      const data = await res.json();
      setToast({ msg: res.ok ? data.message : (data.error ?? "Gagal mengirim email."), type: res.ok ? "success" : "error" });
    } finally { setResetting(false); setResetTarget(null); }
  }

  const totalByRole = ROLE_OPTIONS.filter(r => r.value).reduce((acc, r) => {
    acc[r.value] = users.filter(u => u.role === r.value).length; return acc;
  }, {} as Record<string, number>);

  // Apply client-side shift + completeness filters
  const displayedUsers = users.filter(u => {
    if (shiftFilter === "SHIFT"     && !isShift(u)) return false;
    if (shiftFilter === "NON_SHIFT" &&  isShift(u)) return false;
    const { score } = checkCompleteness(u);
    if (completenessFilter === "LENGKAP"      && score !== 100)  return false;
    if (completenessFilter === "TIDAK_LENGKAP" && score === 100) return false;
    return true;
  });

  const totalShift    = users.filter(u =>  isShift(u)).length;
  const totalNonShift = users.filter(u => !isShift(u)).length;
  const totalLengkap  = users.filter(u => checkCompleteness(u).score === 100).length;

  if (sessionStatus === "loading" || !session) {
    return <main className="w-full flex items-center justify-center min-h-screen"><p className="font-label-bold uppercase animate-pulse">Memuat...</p></main>;
  }
  if (session.user.role !== "SUPER_ADMIN") return null;

  const filterInputCls = "bg-surface-variant border-2 border-on-background rounded-xl px-3 py-2.5 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-colors";

  return (
    <main className="w-full max-w-[var(--spacing-max-width)] mx-auto px-4 md:px-16 flex flex-col items-start flex-grow relative pt-28 pb-24 min-h-screen overflow-x-hidden">

      {/* ── Header ── */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCog size={16} className="text-purple-600" />
            <p className="font-label-bold text-label-bold text-purple-600 uppercase">Super Admin</p>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-background uppercase tracking-tight">MANAJEMEN USER</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-bold text-xs bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1.5 rounded-full">{users.length} user</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-purple-700 text-white border-2 border-on-background rounded-full px-4 py-2 font-label-bold text-xs hard-shadow hard-shadow-hover hard-shadow-active transition-all"
          >
            <UserPlus size={14} /> TAMBAH USER
          </button>
          <button onClick={() => fetchUsers()} className="flex items-center gap-2 bg-surface-variant border-2 border-on-background rounded-full px-4 py-2 font-label-bold text-xs hard-shadow hard-shadow-hover transition-all">
            <RefreshCw size={14} /> REFRESH
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total User"  value={users.length}      color="bg-purple-100"          icon={<Users       size={20} className="text-purple-700"           />} />
        <StatCard label="Admin"       value={(totalByRole.ADMIN ?? 0) + (totalByRole.SUPER_ADMIN ?? 0)} color="bg-primary-container" icon={<Shield size={20} className="text-on-primary" />} />
        <StatCard label="Approver"    value={(totalByRole.OFFICER ?? 0) + (totalByRole.TL ?? 0) + (totalByRole.ASMAN ?? 0) + (totalByRole.MANAGER ?? 0) + (totalByRole.BRANCH_MANAGER ?? 0)} color="bg-amber-100" icon={<CheckCircle size={20} className="text-amber-700" />} />
        <StatCard label="Pegawai"     value={totalByRole.PEGAWAI ?? 0} color="bg-surface-variant" icon={<Users size={20} className="text-on-surface-variant" />} />
        <StatCard label="Shift"       value={totalShift}        color="bg-indigo-100"           icon={<Moon        size={20} className="text-indigo-700"           />} />
        <StatCard label="Data Lengkap" value={totalLengkap}    color="bg-emerald-100"          icon={<CheckCircle size={20} className="text-emerald-700"          />} />
      </div>

      {/* ── Filter Bar ── */}
      <div className="w-full bg-surface-container-lowest border-2 border-on-background rounded-2xl p-5 hard-shadow mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-primary" />
          <p className="font-label-bold text-xs uppercase text-on-surface">Filter & Pencarian</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input id="search-user" type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Cari nama atau NIP..." className={filterInputCls + " pl-9 w-full"} />
          </div>
          {/* Bidang */}
          <div className="relative">
            <select id="filter-bidang" value={bidang} onChange={e => setBidang(e.target.value)} className={filterInputCls + " w-full appearance-none cursor-pointer pr-8"}>
              {BIDANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
          {/* Role */}
          <div className="relative">
            <select id="filter-role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={filterInputCls + " w-full appearance-none cursor-pointer pr-8"}>
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
          {/* Shift filter */}
          <div className="relative">
            <select
              id="filter-shift"
              value={shiftFilter}
              onChange={e => setShiftFilter(e.target.value as "" | "SHIFT" | "NON_SHIFT")}
              className={filterInputCls + " w-full appearance-none cursor-pointer pr-8"}
            >
              <option value="">Semua Kategori</option>
              <option value="SHIFT">Shift</option>
              <option value="NON_SHIFT">Non-Shift</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
          {/* Completeness filter */}
          <div className="relative">
            <select
              id="filter-completeness"
              value={completenessFilter}
              onChange={e => setCompletenessFilter(e.target.value as "" | "LENGKAP" | "TIDAK_LENGKAP")}
              className={filterInputCls + " w-full appearance-none cursor-pointer pr-8"}
            >
              <option value="">Semua Kelengkapan</option>
              <option value="LENGKAP">Data Lengkap</option>
              <option value="TIDAK_LENGKAP">Data Belum Lengkap</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
        {/* Active filter summary */}
        {(shiftFilter || completenessFilter) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-on-background/10">
            <Info size={12} className="text-primary" />
            <p className="font-label-bold text-xs text-on-surface-variant">
              Menampilkan {displayedUsers.length} dari {users.length} user
            </p>
            <button
              onClick={() => { setShiftFilter(""); setCompletenessFilter(""); }}
              className="ml-auto flex items-center gap-1 text-xs font-label-bold text-on-surface-variant border border-on-background/30 px-2.5 py-1 rounded-full hover:bg-surface-variant transition-colors"
            >
              <X size={11} /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* ── User Table ── */}
      {/* Note: displayedUsers applies shift/completeness client filters */}
      {loading ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-label-bold text-xs uppercase text-on-surface-variant animate-pulse">Memuat data user...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
          <Users size={40} className="text-on-surface-variant/40" />
          <p className="text-on-surface-variant text-sm">Tidak ada user ditemukan.</p>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-purple-700 text-white border-2 border-on-background rounded-full px-5 py-2.5 font-label-bold text-sm hard-shadow hard-shadow-hover transition-all">
            <UserPlus size={15} /> TAMBAH USER PERTAMA
          </button>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-16 gap-4">
          <Filter size={36} className="text-on-surface-variant/40" />
          <p className="text-on-surface-variant text-sm">Tidak ada user sesuai filter yang dipilih.</p>
          <button onClick={() => { setShiftFilter(""); setCompletenessFilter(""); }} className="font-label-bold text-xs border-2 border-on-background px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <div className="min-w-full bg-surface-container-lowest border-2 border-on-background rounded-2xl hard-shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-700 text-white border-b-2 border-on-background">
                    {["No", "Nama / NIP", "Jabatan", "Bidang / Sub Bidang", "Kategori", "Role", "Kelengkapan", "Email Personal", "Lembur", "Aksi"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-label-bold text-xs uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((u, idx) => (
                    <tr key={u.id} className={`border-b border-on-background/10 hover:bg-surface-container transition-colors ${idx % 2 === 1 ? "bg-surface-container-low/30" : ""}`}>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-sm text-on-background">{u.nama}</p>
                        <p className="text-xs text-on-surface-variant">{u.nip}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface">{u.jenjangJabatan}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{u.bidang.replace("_", " & ")}</p>
                        <p className="text-xs text-on-surface-variant">{u.subBidang.replace(/_/g, " ")}</p>
                      </td>
                      {/* Shift/Non-Shift badge */}
                      <td className="px-4 py-3">
                        <ShiftBadge user={u} />
                        {isShift(u) && u.tlGroup && (
                          <p className="text-xs text-on-surface-variant mt-1">Grup {u.tlGroup}</p>
                        )}
                      </td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      {/* Completeness */}
                      <td className="px-4 py-3">
                        <CompletenessBadge user={u} />
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">
                        {u.emailPersonal
                          ? <span className="flex items-center gap-1"><Mail size={11} className="text-primary" />{u.emailPersonal}</span>
                          : <span className="italic text-on-surface-variant/40">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-center">{u._count.lemburs}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditUser(u)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-bold text-xs border-2 border-on-background bg-surface-variant hover:bg-primary hover:text-on-primary transition-all hard-shadow">
                            <Edit3 size={12} /> EDIT
                          </button>
                          <button onClick={() => setResetTarget(u)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-bold text-xs border-2 border-on-background bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all hard-shadow">
                            <KeyRound size={12} /> RESET
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-3 w-full">
            {displayedUsers.map(u => (
              <div key={u.id} className="bg-surface-container-lowest border-2 border-on-background rounded-2xl p-4 hard-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-background">{u.nama}</p>
                    <p className="text-xs text-on-surface-variant">{u.nip} · {u.jenjangJabatan}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
                <p className="text-xs text-on-surface-variant mb-1">{u.bidang.replace("_", " & ")} — {u.subBidang.replace(/_/g, " ")}</p>
                {/* Shift + Completeness badges */}
                <div className="flex items-center gap-2 flex-wrap mt-2 mb-2">
                  <ShiftBadge user={u} />
                  <CompletenessBadge user={u} />
                  {isShift(u) && u.tlGroup && (
                    <span className="font-label-bold text-xs text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full border border-on-background/20">
                      Grup {u.tlGroup}
                    </span>
                  )}
                </div>
                {u.emailPersonal && <p className="text-xs text-primary flex items-center gap-1 mb-3"><Mail size={11} />{u.emailPersonal}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditUser(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full font-label-bold text-xs border-2 border-on-background bg-surface-variant hover:bg-primary hover:text-on-primary transition-all">
                    <Edit3 size={12} /> EDIT
                  </button>
                  <button onClick={() => setResetTarget(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full font-label-bold text-xs border-2 border-on-background bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all">
                    <KeyRound size={12} /> RESET PW
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 font-label-bold text-xs uppercase text-on-surface-variant">
            Menampilkan {displayedUsers.length}{displayedUsers.length !== users.length ? ` dari ${users.length}` : ""} user
          </p>
        </>
      )}

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={newUser => {
            setUsers(prev => [newUser, ...prev]);
            setShowAddModal(false);
            setToast({ msg: `Akun ${newUser.nama} berhasil dibuat!`, type: "success" });
          }}
        />
      )}

      {/* ── Edit Modal ── */}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={updated => {
            setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            setEditUser(null);
            setToast({ msg: `${updated.nama} berhasil diperbarui.`, type: "success" });
          }}
        />
      )}

      {/* ── Konfirmasi Reset Password ── */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border-2 border-on-background rounded-[2rem] p-8 hard-shadow w-full max-w-sm flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-on-background flex items-center justify-center"><KeyRound size={28} className="text-amber-700" /></div>
            <div>
              <h2 className="font-bold text-lg uppercase mb-1">Kirim Link Reset?</h2>
              <p className="text-sm text-on-surface-variant">Link reset password akan dikirim ke:</p>
              <p className="font-bold text-sm mt-2 text-primary">{resetTarget.emailPersonal ?? resetTarget.emailPerusahaan ?? "—"}</p>
              <p className="text-xs text-on-surface-variant mt-1">Untuk akun: <strong>{resetTarget.nama}</strong></p>
              {!resetTarget.emailPersonal && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">⚠ User belum punya email personal. Link dikirim ke email perusahaan.</p>
              )}
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={handleSendReset} disabled={resetting} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-label-bold text-sm rounded-full py-3 border-2 border-on-background hard-shadow transition-all disabled:opacity-60">
                {resetting ? <RefreshCw size={15} className="animate-spin" /> : <Mail size={15} />}
                {resetting ? "MENGIRIM..." : "KIRIM LINK"}
              </button>
              <button onClick={() => setResetTarget(null)} className="px-6 py-3 border-2 border-on-background rounded-full font-label-bold text-sm hover:bg-surface-variant transition-colors">BATAL</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
