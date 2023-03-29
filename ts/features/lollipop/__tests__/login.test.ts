import { PublicKey } from "@pagopa/io-react-native-crypto";
import { createStore } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { put, call } from "typed-redux-saga/macro";
import {
  EffectProviders,
  StaticProvider
} from "redux-saga-test-plan/providers";
import * as O from "fp-ts/lib/Option";
import { AssertionRef } from "../../../../definitions/backend/AssertionRef";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { PersistedLollipopState } from "../store";
import { LoggedInWithSessionInfo } from "../../../store/reducers/authentication";
import { PublicSession } from "../../../../definitions/backend/PublicSession";
import { checkLollipopSessionAssertionAndInvalidateIfNeeded } from "../saga";
import { restartCleanApplication } from "../../../sagas/commons";
import { sessionInvalid } from "../../../store/actions/authentication";

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

const mockedSessionInvalid: StaticProvider = [put(sessionInvalid()), true];
const mockedRestartCleanApplication: StaticProvider = [
  call(restartCleanApplication),
  true
];

const mockedFunctions: Array<StaticProvider | EffectProviders> = [
  mockedSessionInvalid,
  mockedRestartCleanApplication
];

describe(`Test login with lollipop check and store aligned with server`, () => {
  it(`should not put sessionIvalid or call restartCleanApplication`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
      DATA_FROM_SERVER.assertionRef
    )
      .provide(mockedFunctions)
      .not.put(sessionInvalid())
      .not.call(restartCleanApplication)
      .run());
});

describe(`Test login with both store key and server key undefined`, () => {
  it(`should put sessionIvalid and call restartCleanApplication`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.none,
      undefined
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());
});

describe(`Test login with lollipop check and store out of alignment with server`, () => {
  it(`should put sessionIvalid and call restartCleanApplication(different key)`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
      "foo" as AssertionRef
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());

  it(`should put sessionIvalid and call restartCleanApplication(server key undefined)`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
      undefined
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());

  it(`should put sessionIvalid and call restartCleanApplication(store key undefined)`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.none,
      DATA_FROM_SERVER.assertionRef
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());
});

// The following functions are for outdated tests, but may come in handy in the future
const createServerCompatibleStore = () => {
  const sessionInfo: PublicSession = {
    ...({} as PublicSession),
    lollipopAssertionRef: DATA_FROM_SERVER.assertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: O.some("foo"),
    publicKey: O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
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
    keyTag: O.some("foo"),
    publicKey: O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
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
    lollipopAssertionRef: "foo" as AssertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: O.some("foo"),
    publicKey: O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
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
    lollipopAssertionRef: undefined
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: O.some("foo"),
    publicKey: O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
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
    lollipopAssertionRef: DATA_FROM_SERVER.assertionRef
  };

  const authentication: LoggedInWithSessionInfo = {
    ...({} as LoggedInWithSessionInfo),
    sessionInfo,
    kind: "LoggedInWithSessionInfo"
  };
  const lollipop: PersistedLollipopState = {
    keyTag: O.none,
    publicKey: O.none,
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
    lollipopAssertionRef: DATA_FROM_SERVER.assertionRef
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
