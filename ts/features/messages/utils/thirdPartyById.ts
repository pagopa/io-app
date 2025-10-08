import {
  EphemeralAARThirdPartyMessage,
  ThirdPartyMessageUnion,
  thirdPartyKind
} from "../types/thirdPartyById";

export const isEphemeralAARThirdPartyMessage = (
  message: ThirdPartyMessageUnion
): message is EphemeralAARThirdPartyMessage =>
  message.kind === thirdPartyKind.AAR;
