import type { ThirdPartyMessageWithContent } from "../../../../definitions/communication/ThirdPartyMessageWithContent";

type ThirdPartyKind = typeof thirdPartyKind;
type StandardThirdPartyMessage = {
  kind: ThirdPartyKind["TPM"];
} & ThirdPartyMessageWithContent;
export type EphemeralAarThirdPartyMessage = {
  kind: ThirdPartyKind["AAR"];
  mandateId?: string;
} & ThirdPartyMessageWithContent;

export type ThirdPartyMessageUnion =
  | StandardThirdPartyMessage
  | EphemeralAarThirdPartyMessage;
export const thirdPartyKind = {
  TPM: "TPM",
  AAR: "AAR"
} as const;
