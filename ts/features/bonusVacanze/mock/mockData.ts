/**
 * This is just a temporary file to define utility types to develop Bonus section
 */

/**
 * - ACTIVE      The bonus has been successfully activated by this user
 * - CANCELLED   The bonus activation was cancelled on purpose and can be resumed
 * - FAILED      The bonus activation failed as the user is currently ineligible
 * - CONSUMED    The bonus is comsumed by this user or any member of the family
 *              and cannot be activated anymore
 */

export enum BonusStatusEnum {
  "ACTIVE" = "ACTIVE",
  "CANCELLED" = "CANCELLED",
  "FAILED" = "FAILED",
  "CONSUMED" = "CONSUMED"
}

export type BonusVacanzaMock = {
  id: string;
  code: string;
  qrCode: {
    mime_type: string;
    base64_content: string;
  };
  status: BonusStatusEnum;
  max_amount: number;
  tax_benefit: number;
  updated_at: Date;
};

const pngBase64 =
  "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";

export const mockedBonus: BonusVacanzaMock = {
  id: "XYZ",
  code: "ABCDE123XYZ",
  status: BonusStatusEnum.ACTIVE,
  qrCode: {
    mime_type: "image/png",
    base64_content: pngBase64
  },
  max_amount: 50000,
  tax_benefit: 3000,
  updated_at: new Date("2020-07-04T12:20:00.000Z")
};
