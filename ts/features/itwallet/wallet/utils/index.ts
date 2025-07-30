import { WalletCard } from "../../../wallet/types";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { isItwCredential } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export const mapCredentialToWalletCard = (
  credential: StoredCredential
): WalletCard => ({
  key: `ITW_${credential.credentialType}`,
  type: "itw",
  category: "itw",
  credentialType: credential.credentialType,
  credentialLevel: isItwCredential(credential.credential) ? "L3" : "L2",
  status: getCredentialStatus(credential)
});
