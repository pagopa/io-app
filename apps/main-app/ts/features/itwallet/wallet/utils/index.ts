import { WalletCard } from "../../../wallet/types";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";

export const mapCredentialToWalletCard = (
  credential: CredentialMetadata
): WalletCard => ({
  key: `ITW_${credential.credentialType}`,
  type: "itw",
  category: "itw",
  credentialType: credential.credentialType,
  credentialStatus: getCredentialStatus(credential),
  issuedAt: credential.jwt.issuedAt
});
