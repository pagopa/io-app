import {
  createCryptoContextFor,
  CredentialIssuance,
  ItwVersion
} from "@pagopa/io-react-native-wallet";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";
import { IssuerConfiguration } from "./itwTypesUtils";
import { getIoWallet } from "./itwIoWallet";

export type InitMrtdPoPChallengeParams = {
  itwVersion: ItwVersion;
  issuerConf: IssuerConfiguration;
  walletInstanceAttestation: string;
  authRedirectUrl: string;
};

export type ValidateMrtdPoPChallengeParams = {
  itwVersion: ItwVersion;
  issuerConf: IssuerConfiguration;
  walletInstanceAttestation: string;
  validationUrl: string;
  mrtd_auth_session: string;
  mrtd_pop_nonce: string;
  mrtd: CredentialIssuance.MRTDPoP.MrtdPayload;
  ias: CredentialIssuance.MRTDPoP.IasPayload;
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
