import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { thirdPartyKind } from "../utils/thirdPartyById";

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
