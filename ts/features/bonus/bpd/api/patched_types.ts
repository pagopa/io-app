import * as t from "io-ts";

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
  "CitizenResource"
);

export type PatchedCitizenResource = t.TypeOf<typeof PatchedCitizenResource>;
