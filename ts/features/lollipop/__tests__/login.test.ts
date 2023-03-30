import { PublicKey } from "@pagopa/io-react-native-crypto";
import { expectSaga } from "redux-saga-test-plan";
import { put, call } from "typed-redux-saga/macro";
import {
  EffectProviders,
  StaticProvider
} from "redux-saga-test-plan/providers";
import * as O from "fp-ts/lib/Option";
import { AssertionRef } from "../../../../definitions/backend/AssertionRef";
import { PublicSession } from "../../../../definitions/backend/PublicSession";
import { checkLollipopSessionAssertionAndInvalidateIfNeeded } from "../saga";
import { restartCleanApplication } from "../../../sagas/commons";
import { sessionInvalid } from "../../../store/actions/authentication";

type DataFromServerType = {
  publicKeyForAssertionRef: PublicKey;
  publicSession: PublicSession;
  publicSessionWithFakeKey: PublicSession;
  publicSessionWithUndefinedKey: PublicSession;
};

const DATA_FROM_SERVER: DataFromServerType = {
  publicKeyForAssertionRef: {
    crv: "P_256",
    kty: "EC",
    x: "nDbpq45jXUKfWxodyvec3F1e+r0oTSqhakbauVmB59Y=",
    y: "CtI6Cozk4O5OJ4Q6WyjiUw9/K6TyU0aDdssd25YHZxg="
  },
  publicSession: {
    ...({} as PublicSession),
    lollipopAssertionRef:
      "sha256-QFnISfpwAico2mmNuiOMGeIdE-qzHqpU1jM3PiI-K_Q" as AssertionRef
  },
  publicSessionWithFakeKey: {
    ...({} as PublicSession),
    lollipopAssertionRef: "foo" as AssertionRef
  },
  publicSessionWithUndefinedKey: {
    ...({} as PublicSession),
    lollipopAssertionRef: undefined
  }
};

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
      O.some(DATA_FROM_SERVER.publicSession)
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
      O.none
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());
});

describe(`Test login with store key and session undefined`, () => {
  it(`should put sessionIvalid and call restartCleanApplication`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
      O.none
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());
});

describe(`Test login with store key undefined and session LollipopAssertion undefined`, () => {
  it(`should put sessionIvalid and call restartCleanApplication`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.none,
      O.some(DATA_FROM_SERVER.publicSessionWithUndefinedKey)
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
      O.some(DATA_FROM_SERVER.publicSessionWithFakeKey)
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());

  it(`should put sessionIvalid and call restartCleanApplication(server key undefined)`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.some(DATA_FROM_SERVER.publicKeyForAssertionRef),
      O.some(DATA_FROM_SERVER.publicSessionWithUndefinedKey)
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());

  it(`should put sessionIvalid and call restartCleanApplication(store key undefined)`, async () =>
    expectSaga(
      checkLollipopSessionAssertionAndInvalidateIfNeeded,
      O.none,
      O.some(DATA_FROM_SERVER.publicSession)
    )
      .provide(mockedFunctions)
      .put(sessionInvalid())
      .call(restartCleanApplication)
      .run());
});
