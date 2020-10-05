import * as t from "io-ts";
import { enumType } from "italia-ts-commons/lib/types";

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
 * patched version of Card / Cards
 * - expiringDate is PatterString('yyyy-MM-dd') instead of string
 */
export enum ProductTypeEnum {
  "PP" = "PP",

  "DEB" = "DEB"
}

export enum ValidityStateEnum {
  "V" = "V",

  "BR" = "BR"
}

// required attributes
const CardR = t.interface({});

// optional attributes
const CardO = t.partial({
  abi: t.string,

  cardNumber: t.string,

  cardPartialNumber: t.string,

  expiringDate: t.string,

  productType: enumType<ProductTypeEnum>(ProductTypeEnum, "productType"),

  tokens: t.readonlyArray(t.string, "array of string"),

  validityState: enumType<ValidityStateEnum>(ValidityStateEnum, "validityState")
});

export const PatchedCard = t.intersection([CardR, CardO], "Card");

export type PatchedCard = t.TypeOf<typeof PatchedCard>;
export const PatchedCards = t.partial({
  data: t.readonlyArray(PatchedCard, "array of Card")
});

export type PatchedCards = t.TypeOf<typeof PatchedCards>;
