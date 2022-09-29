import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { CitizenOptInStatusEnum } from "../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";

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
  payoffInstrType: t.string,
  optInStatus: enumType<CitizenOptInStatusEnum>(
    CitizenOptInStatusEnum,
    "optInStatus"
  )
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
const PatchedCitizenV2ResourceO = t.partial({
  technicalAccount: t.string
});

export const PatchedCitizenV2Resource = t.intersection(
  [PatchedCitizenResourceR, PatchedCitizenResourceO, PatchedCitizenV2ResourceO],
  "PatchedCitizenResourceV2"
);

export type PatchedCitizenV2Resource = t.TypeOf<
  typeof PatchedCitizenV2Resource
>;
