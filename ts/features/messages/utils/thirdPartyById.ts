import {
  EphemeralAarThirdPartyMessage,
  ThirdPartyMessageUnion,
  thirdPartyKind
} from "../types/thirdPartyById";

export const isEphemeralAarThirdPartyMessage = (
  message: ThirdPartyMessageUnion
): message is EphemeralAarThirdPartyMessage =>
  message.kind === thirdPartyKind.AAR;
