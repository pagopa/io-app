import { thumbprint } from "@pagopa/io-react-native-jwt";
import { PID } from "@pagopa/io-react-native-wallet";
import { getPublicKey, sign } from "@pagopa/io-react-native-crypto";
import { walletPidProviderUrl, walletProviderUrl } from "../../../config";
import { ITW_WIA_KEY_TAG } from "./wia";
import { generateCryptoKey } from "./keychain";

export const ITW_PID_KEY_TAG = "ITW_PID_KEY_TAG";

export const getPid = async (instanceAttestation: string) => {
  const walletInstancePublicKey = await getPublicKey(ITW_WIA_KEY_TAG);
  // clientId must be the Wallet Instance public key thumbprint
  const clientId = await thumbprint(walletInstancePublicKey);

  // Start pid issuing flow
  const issuingPID = new PID.Issuing(
    walletPidProviderUrl,
    walletProviderUrl,
    instanceAttestation,
    clientId
  );

  // Generate jwt for PAR wallet instance attestation
  const unsignedJwtForPar = await issuingPID.getUnsignedJwtForPar(
    walletInstancePublicKey
  );
  const parSignature = await sign(unsignedJwtForPar, ITW_WIA_KEY_TAG);

  // PAR request
  await issuingPID.getPar(unsignedJwtForPar, parSignature);

  // Token request
  const authToken = await issuingPID.getAuthToken();

  const pidKey = await generateCryptoKey(ITW_PID_KEY_TAG);

  // Generate nonce proof
  const unsignedNonceProof = await issuingPID.getUnsignedNonceProof(
    authToken.c_nonce
  );
  const nonceProofSignature = await sign(unsignedNonceProof, ITW_PID_KEY_TAG);

  // Generate DPoP for PID key
  const unsignedDPopForPid = await issuingPID.getUnsignedDPoP(pidKey);
  const dPopPidSignature = await sign(unsignedDPopForPid, ITW_PID_KEY_TAG);

  // Credential reuqest
  return await issuingPID.getCredential(
    unsignedDPopForPid,
    dPopPidSignature,
    unsignedNonceProof,
    nonceProofSignature,
    authToken.access_token,
    {
      birthDate: "01/01/1990",
      fiscalCode: "AAABBB00A00A000A",
      name: "NAME",
      surname: "SURNAME"
    }
  );
};
