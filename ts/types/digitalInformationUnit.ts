import { IUnitTag } from "@pagopa/ts-commons/lib/units";

export type Byte = number & IUnitTag<"Byte">;
export type KiloByte = number & IUnitTag<"KiloByte">;
export type MegaByte = number & IUnitTag<"MegaByte">;
export type GigaByte = number & IUnitTag<"GigaByte">;
export type TeraByte = number & IUnitTag<"TeraByte">;
