import { TosConfig } from "@io-app/api-types/generated/definitions/content/TosConfig";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";

export const getTosVersion = (tosData: TosConfig): NonNegativeNumber =>
  tosData.tos_version as NonNegativeNumber;

export const getTosUrl = (tosData: TosConfig): string => tosData.tos_url;
