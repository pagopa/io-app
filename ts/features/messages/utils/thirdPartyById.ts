import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";

export const thirdPartyKind = {
  TPM: "TPM",
  AAR: "AAR"
} as const;

type ThirdPartyKind = typeof thirdPartyKind;

type StandardThirdPartyMessage = {
  kind: ThirdPartyKind["TPM"];
} & ThirdPartyMessageWithContent;
type EphemeralAARThirdPartyMessage = {
  kind: ThirdPartyKind["AAR"];
  mandateId?: string;
} & ThirdPartyMessageWithContent;

export type ThirdPartyMessageUnion =
  | StandardThirdPartyMessage
  | EphemeralAARThirdPartyMessage;

export const isEphemeralAARThirdPartyMessage = (
  message: ThirdPartyMessageUnion
): message is EphemeralAARThirdPartyMessage =>
  message.kind === thirdPartyKind.AAR;
