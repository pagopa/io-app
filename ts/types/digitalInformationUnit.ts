import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import I18n from "../i18n";

export type Byte = number & IUnitTag<"Byte">;
export type KiloByte = number & IUnitTag<"KiloByte">;
export type MegaByte = number & IUnitTag<"MegaByte">;
export type GigaByte = number & IUnitTag<"GigaByte">;
export type TeraByte = number & IUnitTag<"TeraByte">;

const unitOrder = ["B", "kB", "MB", "GB", "TB"];

/**
 * Generate a textual representation for a Digital Information Unit
 * @param b
 * @param startIndex the starting Digital Information Unit
 */
const internalFormatDigitalInformationUnit = (
  b: number,
  startIndex: number
) => {
  // eslint-disable-next-line functional/no-let
  let acc: number = b;
  // eslint-disable-next-line functional/no-let
  let index = startIndex;
  while (acc >= 1024 && index < unitOrder.length - 1) {
    acc /= 1024;
    index++;
  }
  const formatRepresentation = I18n.toNumber(acc, {
    precision: 2,
    delimiter: I18n.t("global.localization.delimiterSeparator"),
    separator: I18n.t("global.localization.decimalSeparator")
  });

  return `${formatRepresentation} ${unitOrder[index]}`;
};

export const formatByte = (b: Byte) =>
  internalFormatDigitalInformationUnit(b, 0);

export const formatKiloByte = (kB: KiloByte) =>
  internalFormatDigitalInformationUnit(kB, 1);
export const formatMegaByte = (mB: MegaByte) =>
  internalFormatDigitalInformationUnit(mB, 2);
export const formatGigaByte = (gB: GigaByte) =>
  internalFormatDigitalInformationUnit(gB, 3);
export const formatTeraByte = (tB: TeraByte) =>
  internalFormatDigitalInformationUnit(tB, 4);
