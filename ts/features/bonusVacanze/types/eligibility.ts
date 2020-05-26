/**
 * TEMPORARY TYPE DEFINITION
 * this type must be replaced with the one auto-generated from spec
 */
import * as t from "io-ts";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { enumType } from "italia-ts-commons/lib/types";

export enum EligibilityCheckStatusEnum {
  "NO_DATA" = "NO_DATA",
  "INELIGIBLE" = "INELIGIBLE",
  "NOT_FOUND" = "NOT_FOUND",
  "ELIGIBLE" = "ELIGIBLE"
}

export const EligibilityCheckStatus = enumType<EligibilityCheckStatusEnum>(
  EligibilityCheckStatusEnum,
  "EligibilityCheckStatus"
);

export type EligibilityCheckStatus = t.TypeOf<typeof EligibilityCheckStatus>;

const FamilyMember = t.interface({
  name: NonEmptyString,
  surname: NonEmptyString
});
export type FamilyMember = t.TypeOf<typeof FamilyMember>;

const EligibilityCheckR = t.interface({
  id: NonEmptyString
});

const EligibilityCheckO = t.partial({
  status: EligibilityCheckStatus,
  max_amount: NonNegativeNumber,
  tax_benefit: NonNegativeNumber,
  members: t.readonlyArray(FamilyMember, "family members")
});

export const EligibilityCheckT = t.intersection(
  [EligibilityCheckR, EligibilityCheckO],
  "EligibilityCheck"
);

export type EligibilityCheck = t.TypeOf<typeof EligibilityCheckT>;
