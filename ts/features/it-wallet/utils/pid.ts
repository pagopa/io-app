import { PID } from "@pagopa/io-react-native-wallet";
import { PublicKey, sign } from "@pagopa/io-react-native-crypto";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { generateCryptoKey } from "./keychain";

/**
 * PID Key Tag for interacting with the keychain.
 */
export const ITW_PID_KEY_TAG = "ITW_PID_KEY_TAG";

/**
 * Getter method which returns a PID credential.
 * @param instanceAttestation - the wallet instance attestation of the current wallet.
 * @param wiaPk - the public key of the wallet instance attestation.
 * @param wiaKt - the key type of the wallet instance attestation.
 * @param pidData - the PID data to be include in the PID credential.
 * @returns a PID credential.
 */
export const getPid = async (
  pidIssuing: PID.Issuing,
  wiaPk: PublicKey,
  wiaKt: string,
  pidData: PidData
) => {
  // Generate jwt for PAR wallet instance attestation
  const unsignedJwtForPar = await pidIssuing.getUnsignedJwtForPar(wiaPk);
  const parSignature = await sign(unsignedJwtForPar, wiaKt);

  // PAR request
  await pidIssuing.getPar(unsignedJwtForPar, parSignature);

  // Token request
  const authToken = await pidIssuing.getAuthToken();

  const pidKey = await generateCryptoKey(ITW_PID_KEY_TAG);

  // Generate nonce proof
  const unsignedNonceProof = await pidIssuing.getUnsignedNonceProof(
    authToken.c_nonce
  );
  const nonceProofSignature = await sign(unsignedNonceProof, ITW_PID_KEY_TAG);

  // Generate DPoP for PID key
  const unsignedDPopForPid = await pidIssuing.getUnsignedDPoP(pidKey);
  const dPopPidSignature = await sign(unsignedDPopForPid, ITW_PID_KEY_TAG);

  // Credential reuqest
  return await pidIssuing.getCredential(
    unsignedDPopForPid,
    dPopPidSignature,
    unsignedNonceProof,
    nonceProofSignature,
    authToken.access_token,
    {
      birthDate: pidData.birthDate,
      fiscalCode: pidData.fiscalCode,
      name: pidData.name,
      surname: pidData.surname
    }
  );
};
