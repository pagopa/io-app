import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";

type ThirdPartyKind = typeof thirdPartyKind;
type StandardThirdPartyMessage = {
  kind: ThirdPartyKind["TPM"];
} & ThirdPartyMessageWithContent;
export type EphemeralAARThirdPartyMessage = {
  kind: ThirdPartyKind["AAR"];
  mandateId?: string;
} & ThirdPartyMessageWithContent;

export type ThirdPartyMessageUnion =
  | StandardThirdPartyMessage
  | EphemeralAARThirdPartyMessage;
export const thirdPartyKind = {
  TPM: "TPM",
  AAR: "AAR"
} as const;
