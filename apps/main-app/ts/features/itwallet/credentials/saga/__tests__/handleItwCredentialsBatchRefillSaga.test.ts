import * as O from "fp-ts/lib/Option";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";

import * as authSelectors from "../../../../authentication/common/store/selectors";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as envSelectors from "../../../common/store/selectors/environment";
import * as itwAttestationUtils from "../../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../../common/utils/itwCredentialIssuanceUtils";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialBundle,
  CredentialMetadata,
  IssuerConfiguration
} from "../../../common/utils/itwTypesUtils";
import * as issuanceSelectors from "../../../issuance/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { itwWalletUnitAttestationsStore } from "../../../walletInstance/store/actions";
import * as walletInstanceSelectors from "../../../walletInstance/store/selectors";
import {
  itwCredentialsBatchRefillRequest,
  itwCredentialsReplaceByType
} from "../../store/actions";
import * as credentialsSelectors from "../../store/selectors";
import { CredentialsVault } from "../../utils/vault";
import { handleItwCredentialsBatchRefillSaga } from "../handleItwCredentialsBatchRefillSaga";
import { handleItwCredentialsReplaceByTypeSaga } from "../handleItwCredentialsReplaceByTypeSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: { get: jest.fn() }
}));
jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const T_SESSION_TOKEN = "session-token";
const T_KEY_TAG = "hardware-key-tag";
const T_WIA = { jwt: "wia-jwt" };
const T_ISSUER_CONF = {
  credential_issuance_batch_size: 5
} as IssuerConfiguration;

const baseMetadata: CredentialMetadata = {
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "eid-key-tag",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-01-01T00:00:00.000Z",
    expiration: "2100-01-01T00:00:00.000Z"
  },
  spec_version: "1.3.3"
};

const eid: CredentialMetadata = baseMetadata;

const proofOfAge: CredentialMetadata = {
  ...baseMetadata,
  credentialType: CredentialType.PROOF_OF_AGE,
  credentialId: "dc_sd_jwt_proof_of_age",
  keyTag: "kt-1",
  keyTags: ["kt-1", "kt-2"]
};

const newBundles = [
  { metadata: { ...proofOfAge, keyTag: "kt-10" }, credential: "raw-1" },
  { metadata: { ...proofOfAge, keyTag: "kt-11" }, credential: "raw-2" }
] as ReadonlyArray<CredentialBundle>;

const authorizedCredentials = [
  {
    keyTags: ["kt-10", "kt-11"],
    authDetails: {
      type: "openid_credential",
      credential_configuration_id: "config-id",
      credential_identifiers: ["credential-id"]
    },
    walletUnitAttestation: "wua-jwt",
    walletUnitAttestationId: "wua-id"
  }
] as unknown as Awaited<
  ReturnType<
    typeof credentialIssuanceUtils.generateBatchKeysWithWalletUnitAttestation
  >
>;

const action = itwCredentialsBatchRefillRequest({
  credentialType: CredentialType.PROOF_OF_AGE,
  trigger: "presentation"
});

const requestCredentialOutput = (issuerConf: IssuerConfiguration) => ({
  clientId: "client-id",
  codeVerifier: "code-verifier",
  responseMode: undefined,
  requestedCredential: {},
  issuerConf,
  evaluatedDcqlQuery: {}
});

/**
 * Sets up the happy path: every pre-flight guard passes. Individual tests then override a single
 * spy to exercise one branch at a time.
 */
const mockHappyPath = () => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
    .mockReturnValue(true);
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(true);
  jest
    .spyOn(connectivitySelectors, "isConnectedSelector")
    .mockReturnValue(true);
  jest
    .spyOn(credentialsSelectors, "itwCredentialsListByTypeSelector")
    .mockReturnValue((() => [proofOfAge]) as never);
  jest
    .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
    .mockReturnValue(O.some(eid) as never);
  jest
    .spyOn(authSelectors, "sessionTokenSelector")
    .mockReturnValue(T_SESSION_TOKEN as never);
  jest
    .spyOn(issuanceSelectors, "itwIntegrityKeyTagSelector")
    .mockReturnValue(O.some(T_KEY_TAG));
  jest
    .spyOn(issuanceSelectors, "itwIntegrityServiceStatusSelector")
    .mockReturnValue("ready");
  jest.spyOn(envSelectors, "selectItwSpecsVersion").mockReturnValue("1.3.3");
  jest.spyOn(envSelectors, "selectItwEnv").mockReturnValue("prod");
  jest
    .spyOn(walletInstanceSelectors, "itwWalletInstanceAttestationSelector")
    .mockReturnValue(T_WIA);
  jest
    .spyOn(itwAttestationUtils, "isWalletInstanceAttestationValid")
    .mockReturnValue(true);
  jest.mocked(getIoWallet).mockReturnValue({
    WalletUnitAttestation: { isSupported: true }
  } as ReturnType<typeof getIoWallet>);
  jest.mocked(CredentialsVault.get).mockResolvedValue("raw-pid");
};

const issuanceProviders = (issuerConf: IssuerConfiguration = T_ISSUER_CONF) =>
  [
    [
      matchers.call.fn(credentialIssuanceUtils.requestCredential),
      requestCredentialOutput(issuerConf)
    ],
    [
      matchers.call.fn(credentialIssuanceUtils.completeAuthFlow),
      { accessToken: {} }
    ],
    [
      matchers.call.fn(
        credentialIssuanceUtils.generateBatchKeysWithWalletUnitAttestation
      ),
      authorizedCredentials
    ],
    [
      matchers.call.fn(credentialIssuanceUtils.obtainCredentialsBatch),
      newBundles
    ],
    [
      matchers.call.fn(credentialIssuanceUtils.attachCredentialsStatus),
      newBundles
    ],
    [matchers.call.fn(handleItwCredentialsReplaceByTypeSaga), undefined]
  ] as Parameters<ReturnType<typeof expectSaga>["provide"]>[0];

describe("handleItwCredentialsBatchRefillSaga", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    mockHappyPath();
  });

  it("replaces the batch and stores the Wallet Unit Attestations on success", () =>
    expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(issuanceProviders())
      .call(
        handleItwCredentialsReplaceByTypeSaga,
        itwCredentialsReplaceByType(newBundles, {})
      )
      .put(itwWalletUnitAttestationsStore({ "wua-id": "wua-jwt" }))
      .run());

  it("does not renew the batch when the wallet is not valid", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    return expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(issuanceProviders())
      .not.call.fn(credentialIssuanceUtils.requestCredential)
      .not.call.fn(handleItwCredentialsReplaceByTypeSaga)
      .run();
  });

  it("does not renew the batch when the device is offline", () => {
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    return expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(issuanceProviders())
      .not.call.fn(credentialIssuanceUtils.requestCredential)
      .run();
  });

  it("does not renew the batch when the session token is missing", () => {
    jest
      .spyOn(authSelectors, "sessionTokenSelector")
      .mockReturnValue(undefined);

    return expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(issuanceProviders())
      .not.call.fn(credentialIssuanceUtils.requestCredential)
      .run();
  });

  it("does not renew the batch when the pool is no longer under threshold", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsListByTypeSelector")
      .mockReturnValue((() => [
        { ...proofOfAge, keyTags: ["kt-1", "kt-2", "kt-3"] }
      ]) as never);

    return expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(issuanceProviders())
      .not.call.fn(credentialIssuanceUtils.requestCredential)
      .run();
  });

  it("does not renew the batch when the integrity service is not ready", () => {
    jest
      .spyOn(issuanceSelectors, "itwIntegrityServiceStatusSelector")
      .mockReturnValue("unavailable");

    return expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(issuanceProviders())
      .not.call.fn(credentialIssuanceUtils.requestCredential)
      .run();
  });

  it("does not renew the batch when the Issuer no longer supports batch issuance", () =>
    expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide(
        issuanceProviders({
          credential_issuance_batch_size: 1
        } as IssuerConfiguration)
      )
      .not.call.fn(credentialIssuanceUtils.obtainCredentialsBatch)
      .not.call.fn(handleItwCredentialsReplaceByTypeSaga)
      .run());

  it("leaves the existing pool untouched when the issuance fails", () =>
    expectSaga(handleItwCredentialsBatchRefillSaga, action)
      .withState({})
      .provide([
        [
          matchers.call.fn(credentialIssuanceUtils.obtainCredentialsBatch),
          throwError(new Error("issuer unreachable"))
        ],
        ...issuanceProviders()
      ] as Parameters<ReturnType<typeof expectSaga>["provide"]>[0])
      .not.call.fn(handleItwCredentialsReplaceByTypeSaga)
      .not.put.actionType(itwWalletUnitAttestationsStore.toString())
      .run());
});
