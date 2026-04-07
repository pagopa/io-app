import {
  EphemeralAARThirdPartyMessage,
  thirdPartyKind,
  ThirdPartyMessageUnion
} from "../types/thirdPartyById";

export const isEphemeralAARThirdPartyMessage = (
  message: ThirdPartyMessageUnion
): message is EphemeralAARThirdPartyMessage =>
  message.kind === thirdPartyKind.AAR;
