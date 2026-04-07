import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";

export type EphemeralAARThirdPartyMessage = ThirdPartyMessageWithContent & {
  kind: ThirdPartyKind["AAR"];
  mandateId?: string;
};
export type ThirdPartyMessageUnion =
  | EphemeralAARThirdPartyMessage
  | StandardThirdPartyMessage;
type StandardThirdPartyMessage = ThirdPartyMessageWithContent & {
  kind: ThirdPartyKind["TPM"];
};

type ThirdPartyKind = typeof thirdPartyKind;
export const thirdPartyKind = {
  TPM: "TPM",
  AAR: "AAR"
} as const;
