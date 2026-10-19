import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { itwIntegrityKeyTagSelector } from "../../../issuance/store/selectors";
import { itwSetWalletInstanceRemotelyActive } from "../../../walletInstance/store/actions";
import {
  checkCurrentWalletInstanceStateSaga,
  getCurrentStatusWalletInstance
} from "../checkCurrentWalletInstanceStateSaga.ts";

describe("checkCurrentWalletInstanceStateSaga", () => {
  test.each([
    {
      name: "remotely active when remote is active, not revoked, and there is no local instance",
      remoteStatus: { is_revoked: false },
      integrityKeyTag: undefined,
      expected: true
    },
    {
      name: "not remotely active when remote is revoked",
      remoteStatus: { is_revoked: true },
      integrityKeyTag: undefined,
      expected: false
    },
    {
      name: "not remotely active when there is a local instance",
      remoteStatus: { is_revoked: false },
      integrityKeyTag: "key-tag",
      expected: false
    },
    {
      name: "not remotely active when remote status is undefined",
      remoteStatus: undefined,
      integrityKeyTag: undefined,
      expected: false
    }
  ])(
    "Sets the wallet instance as $name",
    ({ remoteStatus, integrityKeyTag, expected }) =>
      expectSaga(checkCurrentWalletInstanceStateSaga)
        .provide([
          [matchers.call(getCurrentStatusWalletInstance), remoteStatus],
          [matchers.select(itwIntegrityKeyTagSelector), integrityKeyTag]
        ])
        .put(itwSetWalletInstanceRemotelyActive(expected))
        .run(false)
  );
});
