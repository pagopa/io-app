import {
  createCryptoContextFor,
  CredentialIssuance,
  ItwVersion
} from "@pagopa/io-react-native-wallet";

import { WIA_KEYTAG } from "./itwCryptoContextUtils";
import { getIoWallet } from "./itwIoWallet";
import { IssuerConfiguration } from "./itwTypesUtils";

export type InitMrtdPoPChallengeParams = {
  authRedirectUrl: string;
  issuerConf: IssuerConfiguration;
  itwVersion: ItwVersion;
  walletInstanceAttestation: string;
};

export type ValidateMrtdPoPChallengeParams = {
  ias: CredentialIssuance.MRTDPoP.IasPayload;
  issuerConf: IssuerConfiguration;
  itwVersion: ItwVersion;
  mrtd: CredentialIssuance.MRTDPoP.MrtdPayload;
  mrtd_auth_session: string;
  mrtd_pop_nonce: string;
  validationUrl: string;
  walletInstanceAttestation: string;
};

export const initMrtdPoPChallenge = async ({
  itwVersion,
  authRedirectUrl,
  issuerConf,
  walletInstanceAttestation
}: InitMrtdPoPChallengeParams) => {
  const ioWallet = getIoWallet(itwVersion);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { challenge_info } =
    await ioWallet.CredentialIssuance.continueUserAuthorizationWithMRTDPoPChallenge(
      authRedirectUrl
    );

  const {
    htu: initUrl,
    mrtd_auth_session,
    mrtd_pop_jwt_nonce
  } = await ioWallet.CredentialIssuance.MRTDPoP.verifyAndParseChallengeInfo(
    issuerConf,
    challenge_info,
    { wiaCryptoContext }
  );

  const { pop_verify_endpoint, challenge, mrtd_pop_nonce } =
    await ioWallet.CredentialIssuance.MRTDPoP.initChallenge(
      issuerConf,
      initUrl,
      mrtd_auth_session,
      mrtd_pop_jwt_nonce,
      {
        walletInstanceAttestation,
        wiaCryptoContext
      }
    );

  return {
    challenge,
    mrtd_auth_session,
    mrtd_pop_nonce,
    validationUrl: pop_verify_endpoint
  };
};

export const validateMrtdPoPChallenge = async ({
  itwVersion,
  validationUrl,
  mrtd_auth_session,
  mrtd_pop_nonce,
  issuerConf,
  walletInstanceAttestation,
  ias,
  mrtd
}: ValidateMrtdPoPChallengeParams) => {
  const ioWallet = getIoWallet(itwVersion);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { mrtd_val_pop_nonce, redirect_uri } =
    await ioWallet.CredentialIssuance.MRTDPoP.validateChallenge(
      issuerConf,
      validationUrl,
      mrtd_auth_session,
      mrtd_pop_nonce,
      mrtd,
      ias,
      {
        walletInstanceAttestation,
        wiaCryptoContext
      }
    );

  const { callbackUrl } =
    await ioWallet.CredentialIssuance.MRTDPoP.buildChallengeCallbackUrl(
      redirect_uri,
      mrtd_val_pop_nonce,
      mrtd_auth_session
    );

  return {
    callbackUrl
  };
};
