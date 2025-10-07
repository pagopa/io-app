import {
  ThirdPartyMessageUnion,
  EphemeralAARThirdPartyMessage
} from "../types/thirdPartyById";

export const isEphemeralAARThirdPartyMessage = (
  message: ThirdPartyMessageUnion
): message is EphemeralAARThirdPartyMessage =>
  message.kind === thirdPartyKind.AAR;
export const thirdPartyKind = {
  TPM: "TPM",
  AAR: "AAR"
} as const;
