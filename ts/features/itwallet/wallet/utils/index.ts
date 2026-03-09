import { WalletCard } from "../../../wallet/types";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
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
  issuedAt: credential.jwt.issuedAt,
  isMultiCredential: isMultiLevelCredential(credential)
});
