import { WalletCard } from "../../../wallet/types";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import {
  CredentialMetadata,
  isMultiLevelCredential
} from "../../common/utils/itwTypesUtils";

export const mapCredentialToWalletCard = (
  credential: CredentialMetadata
): WalletCard => ({
  key: `ITW_${credential.credentialType}`,
  type: "itw",
  category: "itw",
  credentialType: credential.credentialType,
  credentialStatus: getCredentialStatus(credential),
  isItwCredential: false, // replaced in SIW-3581
  isMultiCredential: isMultiLevelCredential(credential)
});
