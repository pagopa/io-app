import { PublicKey } from "@pagopa/io-react-native-crypto";
import { createStore } from "redux";
import { AssertionRef } from "../../../../definitions/backend/AssertionRef";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { PersistedLollipopState } from "../store";
import { LoggedInWithSessionInfo } from "../../../store/reducers/authentication";
import { PublicSession } from "../../../../definitions/backend/PublicSession";
import { lollipopKeyCheckWithServer } from "../saga";
import { restartCleanApplication } from "../../../sagas/commons";
import { sessionInvalid } from "../../../store/actions/authentication";
import { expectSaga } from "redux-saga-test-plan";
import { put, call } from "typed-redux-saga/macro";

type DataFromServerType = {
  assertionRef: AssertionRef;
  publicKeyForAssertionRef: PublicKey;
};

const DATA_FROM_SERVER: DataFromServerType = {
  assertionRef:
    "sha256-QFnISfpwAico2mmNuiOMGeIdE-qzHqpU1jM3PiI-K_Q" as AssertionRef,
  publicKeyForAssertionRef: {
    crv: "P_256",
    kty: "EC",
    x: "nDbpq45jXUKfWxodyvec3F1e+r0oTSqhakbauVmB59Y=",
    y: "CtI6Cozk4O5OJ4Q6WyjiUw9/K6TyU0aDdssd25YHZxg="
  }
};

const globalState = appReducer(undefined, applicationChangeState("active"));

describe(`Test login with lollipop check and store aligned with server`, () => {
  it(`should not put sessionIvalid or call restartCleanApplication`, async () => {
    const store = createServerCompatibleStore();

    return expectSaga(lollipopKeyCheckWithServer)
      .withState(store.getState())
      .run();
  });
});

describe(`Test login with lollipop check and store without session information`, () => {
  it(`should not put sessionIvalid or call restartCleanApplication`, async () => {
    const store = createStoreWithoutSessionInformation();

    return expectSaga(lollipopKeyCheckWithServer)
      .withState(store.getState())
      .run();
  });
});

describe(`Test login with lollipop check and store out of alignment with server`, () => {
  it(`should put sessionIvalid and call restartCleanApplication(different key)`, async () => {
    const store = createServerMisalignedStore();

    return expectSaga(lollipopKeyCheckWithServer)
      .withState(store.getState())
      .provide([
        [put(sessionInvalid()), true],
        [call(restartCleanApplication), true]
      ])
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run();
  });

  it(`should put sessionIvalid and call restartCleanApplication(server key undefined)`, async () => {
    const store = createServerMisalignedStore_serverKeyUndefined();

    return expectSaga(lollipopKeyCheckWithServer)
      .withState(store.getState())
      .provide([
        [put(sessionInvalid()), true],
        [call(restartCleanApplication), true]
      ])
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run();
  });

  it(`should put sessionIvalid and call restartCleanApplication(store key undefined)`, async () => {
    const store = createServerMisalignedStore_storeKeyUndefined();

    return expectSaga(lollipopKeyCheckWithServer)
      .withState(store.getState())
      .provide([
        [put(sessionInvalid()), true],
        [call(restartCleanApplication), true]
      ])
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run();
  });
});

describe(`Test login with lollipop check and store with session information, without publicKey`, () => {
  it(`should put sessionIvalid and call restartCleanApplication`, async () => {
    const store = createStoreWithSessionInformationWithoutPublicKey();

    return expectSaga(lollipopKeyCheckWithServer)
      .withState(store.getState())
      .provide([
        [put(sessionInvalid()), true],
        [call(restartCleanApplication), true]
      ])
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run();
  });
});

const createServerCompatibleStore = () => {
  const sessionInfo: PublicSession = {
    ...({} as PublicSession),
    lollipop_assertion_ref: DATA_FROM_SERVER.assertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: "foo",
    publicKey: DATA_FROM_SERVER.publicKeyForAssertionRef,
    _persist: { version: 1, rehydrated: false }
  };
  return createStore(appReducer, {
    ...globalState,
    lollipop,
    authentication
  } as any);
};

const createStoreWithoutSessionInformation = () => {
  const lollipop: PersistedLollipopState = {
    keyTag: "foo",
    publicKey: DATA_FROM_SERVER.publicKeyForAssertionRef,
    _persist: { version: 1, rehydrated: false }
  };
  return createStore(appReducer, {
    ...globalState,
    lollipop
  } as any);
};

const createServerMisalignedStore = () => {
  const sessionInfo: PublicSession = {
    ...({} as PublicSession),
    lollipop_assertion_ref: "foo" as AssertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: "foo",
    publicKey: DATA_FROM_SERVER.publicKeyForAssertionRef,
    _persist: { version: 1, rehydrated: false }
  };
  return createStore(appReducer, {
    ...globalState,
    lollipop,
    authentication
  } as any);
};

const createServerMisalignedStore_serverKeyUndefined = () => {
  const sessionInfo: PublicSession = {
    ...({} as PublicSession),
    lollipop_assertion_ref: undefined
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: "foo",
    publicKey: DATA_FROM_SERVER.publicKeyForAssertionRef,
    _persist: { version: 1, rehydrated: false }
  };
  return createStore(appReducer, {
    ...globalState,
    lollipop,
    authentication
  } as any);
};

const createServerMisalignedStore_storeKeyUndefined = () => {
  const sessionInfo: PublicSession = {
    ...({} as PublicSession),
    lollipop_assertion_ref: DATA_FROM_SERVER.assertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: undefined,
    publicKey: undefined,
    _persist: { version: 1, rehydrated: false }
  };
  return createStore(appReducer, {
    ...globalState,
    lollipop,
    authentication
  } as any);
};

const createStoreWithSessionInformationWithoutPublicKey = () => {
  const sessionInfo: PublicSession = {
    ...({} as PublicSession),
    lollipop_assertion_ref: DATA_FROM_SERVER.assertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  return createStore(appReducer, {
    ...globalState,
    authentication
  } as any);
};
