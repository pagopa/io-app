import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

const mockedEid: StoredCredential = {
  credential: "",
  credentialType: CredentialType.PID,
  parsedCredential: {},
  format: "vc+sd-jwt",
  keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
  issuerConf: {} as StoredCredential["issuerConf"]
};

const mockedCredential: StoredCredential = {
  credential: "",
  credentialType: CredentialType.DRIVING_LICENSE,
  parsedCredential: {},
  format: "vc+sd-jwt",
  keyTag: "d191ad52-2674-46f3-9610-6eb7bd9146a3",
  issuerConf: {} as StoredCredential["issuerConf"]
};

const mockedCredential2: StoredCredential = {
  credential: "",
  credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
  parsedCredential: {},
  format: "vc+sd-jwt",
  keyTag: "07ccc69a-d1b5-4c3c-9955-6a436d0c3710",
  issuerConf: {} as StoredCredential["issuerConf"]
};

describe("ITW credentials reducer", () => {
  it("should add the eID", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([]);
  });

  it("should add a credential when the eID is present", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid)),
      curriedAppReducer(itwCredentialsStore(mockedCredential))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([
      O.some(mockedCredential)
    ]);
  });

  it("should add multiple credentials with a single action when the eID is present", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid)),
      curriedAppReducer(
        itwCredentialsStore([mockedCredential, mockedCredential2])
      )
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([
      O.some(mockedCredential),
      O.some(mockedCredential2)
    ]);
  });

  it("should add the eID and a credential with a single action", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore([mockedCredential, mockedEid]))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([
      O.some(mockedCredential)
    ]);
  });

  it("should NOT add a credential when the eID is missing", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedCredential))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(O.none);
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([]);
  });

  it("should NOT remove the eID", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid)),
      curriedAppReducer(itwCredentialsRemove(mockedEid))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
  });

  it("should remove a credential different than the eID", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid)),
      curriedAppReducer(itwCredentialsStore(mockedCredential)),
      curriedAppReducer(itwCredentialsRemove(mockedCredential))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([]);
  });

  it("should reset the state", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid)),
      curriedAppReducer(itwCredentialsStore(mockedCredential)),
      curriedAppReducer(itwLifecycleStoresReset())
    );

    expect(targetSate.features.itWallet.credentials).toEqual({
      eid: O.none,
      credentials: []
    });
  });

  it("should update existing credentials overwriting the previous instances", () => {
    const credentialUpdate: StoredCredential = {
      ...mockedCredential2,
      storedStatusAttestation: {
        credentialStatus: "valid" as const,
        statusAttestation: "abc",
        parsedStatusAttestation: { exp: 1000 } as ParsedStatusAttestation
      }
    };

    const updatedCredential = { ...mockedCredential2, ...credentialUpdate };

    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwCredentialsStore(mockedEid)),
      curriedAppReducer(
        itwCredentialsStore([mockedCredential, mockedCredential2])
      ),
      curriedAppReducer(itwCredentialsStore(credentialUpdate))
    );

    expect(targetSate.features.itWallet.credentials.eid).toEqual(
      O.some(mockedEid)
    );
    expect(targetSate.features.itWallet.credentials.credentials).toEqual([
      O.some(mockedCredential),
      O.some(updatedCredential)
    ]);
  });
});
