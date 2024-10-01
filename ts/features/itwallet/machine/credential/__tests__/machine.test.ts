/* eslint-disable sonarjs/no-identical-functions */
import { CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  AuthorizationDetail,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { waitFor } from "@testing-library/react-native";
import _ from "lodash";
import {
  createActor,
  fromPromise,
  StateFrom,
  waitFor as waitForActor
} from "xstate";
import {
  ItwStatusAttestationMocks,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import { ItwTags } from "../../tags";
import {
  InitializeWalletActorOutput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainStatusAttestationActorInput,
  OnInitActorOutput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput
} from "../actors";
import { Context, InitialContext } from "../context";
import { CredentialIssuanceFailureTypeEnum } from "../failure";
import {
  ItwCredentialIssuanceMachine,
  itwCredentialIssuanceMachine
} from "../machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

const T_WIA: string = "abcdefg";
const T_WIA_CRYPTO_CONTEXT: CryptoContext = {
  getPublicKey: async () => null,
  getSignature: async () => ""
};

const T_CLIENT_ID = "clientId";
const T_CODE_VERIFIER = "codeVerifier";
const T_ISSUER_CONFIG: IssuerConfiguration = {
  federation_entity: {},
  oauth_authorization_server: {
    jwks: {
      keys: []
    },
    acr_values_supported: [],
    authorization_endpoint: "",
    pushed_authorization_request_endpoint: "",
    token_endpoint: "",
    client_registration_types_supported: [],
    code_challenge_methods_supported: [],
    grant_types_supported: [],
    issuer: "",
    scopes_supported: [],
    response_modes_supported: [],
    token_endpoint_auth_methods_supported: [],
    token_endpoint_auth_signing_alg_values_supported: [],
    request_object_signing_alg_values_supported: []
  },
  openid_credential_issuer: {
    credential_configurations_supported: {},
    credential_endpoint: "",
    credential_issuer: "",
    status_attestation_endpoint: "",
    revocation_endpoint: "",
    display: [],
    jwks: {
      keys: []
    }
  },
  wallet_relying_party: {
    jwks: {
      keys: []
    }
  }
};
const T_CREDENTIAL_DEFINITION: AuthorizationDetail = {
  credential_configuration_id: "",
  format: "vc+sd-jwt",
  type: "openid_credential"
};
const T_REQUESTED_CREDENTIAL: RequestObject = {
  client_id: T_CLIENT_ID,
  client_id_scheme: "entity_id",
  exp: 0,
  iat: 0,
  iss: "",
  nonce: "",
  response_mode: "direct_post.jwt",
  response_type: "vp_token",
  response_uri: "",
  scope: "",
  state: ""
};
const T_STORED_STATUS_ATTESTATION: StoredCredential["storedStatusAttestation"] =
  {
    credentialStatus: "valid",
    statusAttestation: "abcdefghijklmnopqrstuvwxyz",
    parsedStatusAttestation: ItwStatusAttestationMocks.mdl
  };

describe("itwCredentialIssuanceMachine", () => {
  const navigateToTrustIssuerScreen = jest.fn();
  const navigateToCredentialPreviewScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const storeCredential = jest.fn();
  const closeIssuance = jest.fn();
  const handleSessionExpired = jest.fn();

  const initializeWallet = jest.fn();
  const requestCredential = jest.fn();
  const obtainCredential = jest.fn();
  const obtainStatusAttestation = jest.fn();

  const isSessionExpired = jest.fn();

  const mockedMachine = itwCredentialIssuanceMachine.provide({
    actions: {
      navigateToCredentialPreviewScreen,
      navigateToTrustIssuerScreen,
      navigateToFailureScreen,
      navigateToWallet,
      storeCredential,
      closeIssuance,
      handleSessionExpired
    },
    actors: {
      onInit: fromPromise<OnInitActorOutput>(async () => ({
        integrityKeyTag: "",
        walletInstanceAttestation: "",
        wiaCryptoContext: createCryptoContextFor("")
      })),
      requestCredential: fromPromise<
        RequestCredentialActorOutput,
        RequestCredentialActorInput
      >(requestCredential),
      obtainCredential: fromPromise<
        ObtainCredentialActorOutput,
        ObtainCredentialActorInput
      >(obtainCredential),
      obtainStatusAttestation: fromPromise<
        StoredCredential,
        ObtainStatusAttestationActorInput
      >(obtainStatusAttestation)
    },
    guards: {
      isSessionExpired
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should obtain a credential with a valid status attestation", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Initialize wallet and start credential issuance
     */

    initializeWallet.mockImplementation(() =>
      Promise.resolve({
        walletInstanceAttestation: T_WIA,
        wiaCryptoContext: T_WIA_CRYPTO_CONTEXT
      })
    );

    requestCredential.mockImplementation(() =>
      Promise.resolve({
        clientId: T_CLIENT_ID,
        codeVerifier: T_CODE_VERIFIER,
        credentialDefinition: T_CREDENTIAL_DEFINITION,
        requestedCredential: T_REQUESTED_CREDENTIAL,
        issuerConf: T_ISSUER_CONFIG
      })
    );

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      skipNavigation: true
    });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInitialization");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(initializeWallet).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      walletInstanceAttestation: T_WIA,
      clientId: T_CLIENT_ID,
      codeVerifier: T_CODE_VERIFIER,
      credentialDefinition: T_CREDENTIAL_DEFINITION,
      requestedCredential: T_REQUESTED_CREDENTIAL,
      issuerConf: T_ISSUER_CONFIG
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(1);

    /**
     * Obtain credential
     */

    obtainCredential.mockImplementation(() =>
      Promise.resolve({
        credential: ItwStoredCredentialsMocks.ts
      })
    );

    obtainStatusAttestation.mockImplementation(() =>
      Promise.resolve({
        ...ItwStoredCredentialsMocks.ts,
        storedStatusAttestation: T_STORED_STATUS_ATTESTATION
      })
    );

    actor.send({
      type: "confirm-trust-data"
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Issuing]));

    // Step 1: get the credential
    const intermediateState1 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingCredential" })
    );
    expect(intermediateState1.value).toStrictEqual({
      Issuance: "ObtainingCredential"
    });
    expect(obtainCredential).toHaveBeenCalledTimes(1);

    // Step 2: get the status attestation
    const intermediateState2 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingStatusAttestation" })
    );
    expect(intermediateState2.value).toStrictEqual({
      Issuance: "ObtainingStatusAttestation"
    });
    expect(obtainStatusAttestation).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(actor.getSnapshot().context).toEqual(
      expect.objectContaining<Partial<Context>>({
        credential: {
          ...ItwStoredCredentialsMocks.ts,
          storedStatusAttestation: T_STORED_STATUS_ATTESTATION
        }
      })
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));
    expect(navigateToCredentialPreviewScreen).toHaveBeenCalledTimes(1);

    /**
     * Store the credential
     */

    actor.send({
      type: "add-to-wallet"
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(storeCredential).toHaveBeenCalledTimes(1);
    expect(navigateToWallet).toHaveBeenCalledTimes(1);
  });

  it("Should not store the credential if the user closes the issuance", () => {
    /** Initial part is the same as the previous test, we can start from the preview */

    const initialSnapshot: MachineSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "DisplayingCredentialPreview",
      context: {
        credential: ItwStoredCredentialsMocks.ts
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credential: ItwStoredCredentialsMocks.ts
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(storeCredential).toHaveBeenCalledTimes(0);
    expect(navigateToWallet).toHaveBeenCalledTimes(0);
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should go to failure if wallet initialization fails", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Initialize wallet and start credential issuance
     */

    initializeWallet.mockImplementation(() => Promise.reject("SOME FAILURE"));

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      skipNavigation: true
    });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInitialization");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(initializeWallet).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(0));

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      failure: {
        type: CredentialIssuanceFailureTypeEnum.GENERIC,
        reason: "SOME FAILURE"
      }
    });

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should go to failure if credential request fails", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Initialize wallet and start credential issuance
     */

    initializeWallet.mockImplementation(() =>
      Promise.resolve({
        walletInstanceAttestation: T_WIA,
        wiaCryptoContext: T_WIA_CRYPTO_CONTEXT
      })
    );

    requestCredential.mockImplementation(() => Promise.reject("SOME FAILURE"));

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      skipNavigation: true
    });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInitialization");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(initializeWallet).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      failure: {
        type: CredentialIssuanceFailureTypeEnum.GENERIC,
        reason: "SOME FAILURE"
      }
    });

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should close the issuance if the user does not confirm trust issuer data", () => {
    /** Initial part is the same as the previous test, we can start from the preview */

    const initialSnapshot: MachineSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "DisplayingTrustIssuer"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should go to failure if credential issaunce fails", async () => {
    /** Initial part is the same as the previous test, we can start from the preview */

    const initialSnapshot: MachineSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "DisplayingTrustIssuer"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    obtainCredential.mockImplementation(() => Promise.reject("SOME FAILURE"));

    actor.send({
      type: "confirm-trust-data"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "ObtainingCredential"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Issuing]));
    await waitFor(() => expect(obtainCredential).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(obtainStatusAttestation).not.toHaveBeenCalled());

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      failure: {
        type: CredentialIssuanceFailureTypeEnum.GENERIC,
        reason: "SOME FAILURE"
      }
    });

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to the next screen if skipNavigation is false", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    initializeWallet.mockImplementation(() =>
      Promise.resolve({
        walletInstanceAttestation: T_WIA,
        wiaCryptoContext: T_WIA_CRYPTO_CONTEXT
      })
    );

    requestCredential.mockImplementation(() =>
      Promise.resolve({
        clientId: T_CLIENT_ID,
        codeVerifier: T_CODE_VERIFIER,
        credentialDefinition: T_CREDENTIAL_DEFINITION,
        requestedCredential: T_REQUESTED_CREDENTIAL,
        issuerConf: T_ISSUER_CONFIG
      })
    );

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      skipNavigation: false
    });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInitialization");
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(1);
  });
});
