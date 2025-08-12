import { WalletCard } from "../../../wallet/types";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import {
  CredentialFormat,
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
  isLegacyFormat: credential.format === CredentialFormat.LEGACY_SD_JWT
});
