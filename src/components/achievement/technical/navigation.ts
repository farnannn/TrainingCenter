// ==============================================================================
// Deep-link helper: membuka tab tertentu di halaman Program Technical Training
// ketika navigasi berasal dari halaman Capaian Training.
// ==============================================================================
let pendingProgramTab: string | null = null;

export const setPendingProgramTab = (tab: string | null) => {
  pendingProgramTab = tab;
};

export const consumePendingProgramTab = (): string | null => {
  const t = pendingProgramTab;
  pendingProgramTab = null;
  return t;
};

