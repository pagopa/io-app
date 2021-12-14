import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import I18n from "../i18n";

export type Byte = number & IUnitTag<"Byte">;
export type KiloByte = number & IUnitTag<"KiloByte">;
export type MegaByte = number & IUnitTag<"MegaByte">;
export type GigaByte = number & IUnitTag<"GigaByte">;
export type TeraByte = number & IUnitTag<"TeraByte">;

const unitOrder = ["B", "kB", "MB", "GB", "TB"];

export const formatByte = (b: Byte) => {
  // eslint-disable-next-line functional/no-let
  let acc: number = b;
  // eslint-disable-next-line functional/no-let
  let index = 0;
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

export const formatKiloByte = (kB: KiloByte) => formatByte((kB * 1024) as Byte);
export const formatMegaByte = (mB: MegaByte) =>
  formatKiloByte((mB * 1024) as KiloByte);
export const formatGigaByte = (gB: GigaByte) =>
  formatMegaByte((gB * 1024) as MegaByte);
export const formatTeraByte = (tB: TeraByte) =>
  formatGigaByte((tB * 1024) as GigaByte);
