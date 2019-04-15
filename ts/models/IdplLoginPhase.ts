type IdpLoginBase = {
  id: string;
  duration?: number;
};

export type IdplLoginPhase = {
  detail: string;
} & IdpLoginBase;

export type IdpLoginEnd = {
  success: boolean;
} & IdpLoginBase;
