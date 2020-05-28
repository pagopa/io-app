import * as t from "io-ts";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import { enumType } from "italia-ts-commons/lib/types";
import { Timestamp } from "../../../../definitions/backend/Timestamp";

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
