import * as t from "io-ts";
import { NonEmptyString, FiscalCode } from "italia-ts-commons/lib/strings";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { Timestamp } from "../../../../definitions/backend/Timestamp";
import { enumType } from "italia-ts-commons/lib/types";

export enum BonusStatusEnum {
  "ACTIVE" = "ACTIVE",
  "CANCELLED" = "CANCELLED",
  "FAILED" = "FAILED",
  "CONSUMED" = "CONSUMED"
}
export const BonusStatusEnumT = enumType<BonusStatusEnum>(
  BonusStatusEnum,
  "BonusStatusEnum"
);

export const BonusVacanzeT = t.interface({
  id: t.string,
  applicant_fiscal_code: FiscalCode,
  code: t.string,
  qr_code: t.interface({
    mime_type: t.string,
    base64_content: t.string
  }),
  max_amount: NonNegativeInteger,
  max_tax_benefit: NonNegativeInteger,
  updated_at: Timestamp,
  status: BonusStatusEnumT
});

export type BonusVacanze = t.TypeOf<typeof BonusVacanzeT>;
