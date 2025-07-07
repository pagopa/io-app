import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import {
  ParsedStatusAttestation,
  StoredCredential
} from "../../../../common/utils/itwTypesUtils";
import { itwCredentialsRemove, itwCredentialsStore } from "../../actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import { reproduceSequence } from "../../../../../../utils/tests";

const mockedEid: StoredCredential = {
  credential: "",
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

const mockedCredential: StoredCredential = {
  credential: "",
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "d191ad52-2674-46f3-9610-6eb7bd9146a3",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

const mockedCredential2: StoredCredential = {
  credential: "",
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "mso_mdoc",
  parsedCredential: {},
  format: "mso_mdoc_mDL",
  keyTag: "07ccc69a-d1b5-4c3c-9955-6a436d0c3710",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

describe("ITW credentials reducer", () => {
  it("should add the eID", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid])
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({
      [mockedEid.credentialId]: mockedEid
    });
  });

  it("should add a credential when the eID is present", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid]),
      itwCredentialsStore([mockedCredential])
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({
      [mockedEid.credentialId]: mockedEid,
      [mockedCredential.credentialId]: mockedCredential
    });
  });

  it("should add multiple credentials with a single action", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid, mockedCredential, mockedCredential2])
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({
      [mockedEid.credentialId]: mockedEid,
      [mockedCredential.credentialId]: mockedCredential,
      [mockedCredential2.credentialId]: mockedCredential2
    });
  });

  it("should remove a single credential", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid]),
      itwCredentialsStore([mockedCredential]),
      itwCredentialsRemove(mockedCredential)
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({
      [mockedEid.credentialId]: mockedEid
    });
  });

  it("should remove multiple credentials of the same type", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid]),
      itwCredentialsStore([mockedCredential, mockedCredential2]),
      itwCredentialsRemove(mockedCredential)
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({
      [mockedEid.credentialId]: mockedEid
    });
  });

  it("should reset the state", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid]),
      itwCredentialsStore([mockedCredential]),
      itwLifecycleStoresReset()
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({});
  });

  it("should update existing credentials overwriting the previous instances", () => {
    const updatedCredential: StoredCredential = {
      ...mockedCredential,
      storedStatusAttestation: {
        credentialStatus: "valid" as const,
        statusAttestation: "abc",
        parsedStatusAttestation: { exp: 1000 } as ParsedStatusAttestation
      }
    };

    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      itwCredentialsStore([mockedEid]),
      itwCredentialsStore([mockedCredential, mockedCredential2]),
      itwCredentialsStore([updatedCredential])
    ];
    const targetSate = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(targetSate.features.itWallet.credentials.credentials).toEqual({
      [mockedEid.credentialId]: mockedEid,
      [mockedCredential.credentialId]: updatedCredential,
      [mockedCredential2.credentialId]: mockedCredential2
    });
  });
});
