import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { TosConfig } from "../../../definitions/content/TosConfig";

export const getTosVersion = (tosData: TosConfig): NonNegativeNumber =>
  tosData.tos_version as NonNegativeNumber;

export const getTosUrl = (tosData: TosConfig): string => tosData.tos_url;
