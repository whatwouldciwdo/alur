import { SubBidang } from "@prisma/client";

export interface WorkflowStep {
  step: number;
  roleName: string;
  requiredRole: string;
  bidang?: string;
  subBidang?: string;
}

type WorkflowMap = Record<SubBidang, WorkflowStep[]>;

export const WORKFLOW: WorkflowMap = {
  KEPMO: [
    { step: 1, roleName: "Officer Kepmo", requiredRole: "OFFICER", subBidang: "KEPMO" },
    { step: 2, roleName: "Asman Kepmo", requiredRole: "ASMAN", subBidang: "KEPMO" },
    { step: 3, roleName: "Manager Operasi", requiredRole: "MANAGER", bidang: "OPERASI" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  LINGKUNGAN: [
    { step: 1, roleName: "Officer Lingkungan", requiredRole: "OFFICER", subBidang: "LINGKUNGAN" },
    // Asman K3L melayani K3 & Lingkungan — user disimpan dengan subBidang K3
    { step: 2, roleName: "Asman K3L", requiredRole: "ASMAN", subBidang: "K3" },
    { step: 3, roleName: "Manager Operasi", requiredRole: "MANAGER", bidang: "OPERASI" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  K3: [
    { step: 1, roleName: "Officer K3", requiredRole: "OFFICER", subBidang: "K3" },
    { step: 2, roleName: "Asman K3L", requiredRole: "ASMAN", subBidang: "K3" },
    { step: 3, roleName: "Manager Operasi", requiredRole: "MANAGER", bidang: "OPERASI" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  OPERATOR_SHIFT: [
    { step: 1, roleName: "TL Shift", requiredRole: "TL", subBidang: "OPERATOR_SHIFT" },
    { step: 2, roleName: "Asman Operasi", requiredRole: "ASMAN", subBidang: "OPERATOR_SHIFT" },
    { step: 3, roleName: "Manager Operasi", requiredRole: "MANAGER", bidang: "OPERASI" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  OPERATOR_NIAGA: [
    { step: 1, roleName: "Asman Niaga", requiredRole: "ASMAN", subBidang: "OPERATOR_NIAGA" },
    { step: 2, roleName: "Manager Operasi", requiredRole: "MANAGER", bidang: "OPERASI" },
    { step: 3, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 4, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  SDM: [
    { step: 1, roleName: "Officer SDM", requiredRole: "OFFICER", subBidang: "SDM" },
    { step: 2, roleName: "Asman SDM", requiredRole: "ASMAN", subBidang: "SDM" },
    { step: 3, roleName: "Manager SDM & Keu", requiredRole: "MANAGER", bidang: "SDM_KEU" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  UMUM: [
    { step: 1, roleName: "Officer Umum", requiredRole: "OFFICER", subBidang: "UMUM" },
    { step: 2, roleName: "Asman Umum", requiredRole: "ASMAN", subBidang: "UMUM" },
    { step: 3, roleName: "Manager SDM & Keu", requiredRole: "MANAGER", bidang: "SDM_KEU" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  // Keuangan tidak punya step Officer — langsung mulai dari Asman
  KEUANGAN: [
    { step: 1, roleName: "Asman Keu & Akuntansi", requiredRole: "ASMAN", subBidang: "KEUANGAN" },
    { step: 2, roleName: "Manager SDM & Keu", requiredRole: "MANAGER", bidang: "SDM_KEU" },
    { step: 3, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 4, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  // PBJ tidak punya step Officer — langsung mulai dari Asman
  PBJ: [
    { step: 1, roleName: "Asman PBJ", requiredRole: "ASMAN", subBidang: "PBJ" },
    { step: 2, roleName: "Manager SDM & Keu", requiredRole: "MANAGER", bidang: "SDM_KEU" },
    { step: 3, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 4, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  LISTRIK: [
    { step: 1, roleName: "TL Listrik", requiredRole: "TL", subBidang: "LISTRIK" },
    { step: 2, roleName: "Asman Listrik", requiredRole: "ASMAN", subBidang: "LISTRIK" },
    { step: 3, roleName: "Manager Pemeliharaan", requiredRole: "MANAGER", bidang: "PEMELIHARAAN" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  IC: [
    { step: 1, roleName: "TL I&C", requiredRole: "TL", subBidang: "IC" },
    // Asman I&C = Asman Listrik (Syahrial) — disimpan di subBidang LISTRIK
    { step: 2, roleName: "Asman I&C", requiredRole: "ASMAN", subBidang: "LISTRIK" },
    { step: 3, roleName: "Manager Pemeliharaan", requiredRole: "MANAGER", bidang: "PEMELIHARAAN" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  MEKANIK: [
    { step: 1, roleName: "TL Mekanik", requiredRole: "TL", subBidang: "MEKANIK" },
    { step: 2, roleName: "Asman Mekanik", requiredRole: "ASMAN", subBidang: "MEKANIK" },
    { step: 3, roleName: "Manager Pemeliharaan", requiredRole: "MANAGER", bidang: "PEMELIHARAAN" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  BOP: [
    { step: 1, roleName: "TL BOP", requiredRole: "TL", subBidang: "BOP" },
    // Asman BOP = Asman Mekanik (Yunarko) — disimpan di subBidang MEKANIK
    { step: 2, roleName: "Asman BOP", requiredRole: "ASMAN", subBidang: "MEKANIK" },
    { step: 3, roleName: "Manager Pemeliharaan", requiredRole: "MANAGER", bidang: "PEMELIHARAAN" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  PDM: [
    { step: 1, roleName: "TL PDM", requiredRole: "TL", subBidang: "PDM" },
    { step: 2, roleName: "Asman PDM", requiredRole: "ASMAN", subBidang: "PDM" },
    { step: 3, roleName: "Manager Engineering", requiredRole: "MANAGER", bidang: "ENGINEERING" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
  ADMIN_SEKRETARIS: [
    { step: 1, roleName: "Officer Kinerja", requiredRole: "OFFICER", subBidang: "ADMIN_SEKRETARIS" },
    { step: 2, roleName: "Asman EKSIS", requiredRole: "ASMAN", subBidang: "ADMIN_SEKRETARIS" },
    { step: 3, roleName: "Manager Engineering", requiredRole: "MANAGER", bidang: "ENGINEERING" },
    { step: 4, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
    { step: 5, roleName: "Admin", requiredRole: "ADMIN" },
  ],
};

export function getWorkflowSteps(subBidang: SubBidang): WorkflowStep[] {
  return WORKFLOW[subBidang] ?? [];
}

export function getNextStep(subBidang: SubBidang, currentStep: number): WorkflowStep | null {
  return getWorkflowSteps(subBidang).find((s) => s.step === currentStep + 1) ?? null;
}

export function getTotalSteps(subBidang: SubBidang): number {
  return getWorkflowSteps(subBidang).length;
}

/**
 * Alur khusus untuk ADMIN (perekap) yang mengajukan lembur.
 * Tidak melalui rantai bidang — langsung ke Branch Manager.
 */
export const ADMIN_WORKFLOW: WorkflowStep[] = [
  { step: 1, roleName: "Branch Manager IPS", requiredRole: "BRANCH_MANAGER" },
];
