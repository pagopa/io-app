import { WalletCard } from "../../../wallet/types";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { isItwCredential } from "../../common/utils/itwCredentialUtils";
import {
  isMultiLevelCredential,
  StoredCredential
} from "../../common/utils/itwTypesUtils";

export const mapCredentialToWalletCard = (
  credential: StoredCredential
): WalletCard => ({
  key: `ITW_${credential.credentialType}`,
  type: "itw",
  category: "itw",
  credentialType: credential.credentialType,
  credentialStatus: getCredentialStatus(credential),
  isItwCredential: isItwCredential(credential),
  isMultiCredential: isMultiLevelCredential(credential)
});
