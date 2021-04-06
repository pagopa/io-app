import * as t from "io-ts";

/**
 * patched version of CitizenResource
 * - payoffInstr and payoffInstrType must be optional
 */
// required attributes
const PatchedCitizenResourceR = t.interface({
  enabled: t.boolean,

  fiscalCode: t.string
});

// optional attributes
const PatchedCitizenResourceO = t.partial({
  payoffInstr: t.string,

  payoffInstrType: t.string
});

export const PatchedCitizenResource = t.intersection(
  [PatchedCitizenResourceR, PatchedCitizenResourceO],
  "PatchedCitizenResource"
);

export type PatchedCitizenResource = t.TypeOf<typeof PatchedCitizenResource>;

/**
 * patched version of CitizenV2Resource
 * - technicalAccount must be optional
 */
// required attributes
const PatchedCitizenV2ResourceO = t.interface({
  technicalAccount: t.string
});

export const PatchedCitizenV2Resource = t.intersection(
  [PatchedCitizenResourceR, PatchedCitizenResourceO, PatchedCitizenV2ResourceO],
  "PatchedCitizenResource"
);

export type PatchedCitizenV2Resource = t.TypeOf<
  typeof PatchedCitizenV2Resource
>;
