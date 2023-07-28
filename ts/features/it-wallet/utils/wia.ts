import { sign } from "@pagopa/io-react-native-crypto";
import { WalletInstanceAttestation } from "@pagopa/io-react-native-wallet";
import { walletProviderUrl } from "../../../config";
import { generateCryptoKey } from "./keychain";

/**
 * The key alias used to store the WIA crypto key in the keychain.
 */
export const ITW_WIA_KEY_TAG = "ITW_WIA_CRYTPO";

/**
 * Getter for the Wallet Instance Attestation.
 * It generates a new key pair and uses it to sign the attestation request.
 * @returns the WIA attestation
 */
export const getWia = async () => {
  const publicKey = await generateCryptoKey(ITW_WIA_KEY_TAG);
  const issuing = new WalletInstanceAttestation.Issuing(walletProviderUrl);
  const attestationRequest = await issuing.getAttestationRequestToSign(
    publicKey
  );
  const signature = await sign(attestationRequest, ITW_WIA_KEY_TAG);
  return (
    await issuing.getAttestation(attestationRequest, signature)
  ).toString();
};
