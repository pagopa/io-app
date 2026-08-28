import { testSaga } from "redux-saga-test-plan";

import { waitForConnection, watchItwAuthenticatedSaga, watchItwSaga } from "..";
import { setConnectionStatus } from "../../../../connectivity/store/actions";
import { isConnectedSelector } from "../../../../connectivity/store/selectors";
import {
  syncItwAnalyticsProperties,
  updateNfcInfoTrackingProperties,
  watchItwAnalyticsSaga
} from "../../../analytics/saga";
import { watchItwCredentialsSaga } from "../../../credentials/saga";
import { checkCredentialsBatchRefill } from "../../../credentials/saga/checkCredentialsBatchRefill";
import { checkCredentialsStatusAssertion } from "../../../credentials/saga/checkCredentialsStatusAssertion";
import { handleItwCredentialsVaultCoherenceSaga } from "../../../credentials/saga/handleItwCredentialsVaultCoherenceSaga";
import { handleItwCredentialsVaultMigrationSaga } from "../../../credentials/saga/handleItwCredentialsVaultMigrationSaga";
import { handleWalletCredentialsRehydration } from "../../../credentials/saga/handleWalletCredentialsRehydration";
import { handleWalletUnitAttestationsCleanUp } from "../../../credentials/saga/handleWalletUnitAttestationsCleanUp";
import { watchItwCredentialsCatalogueSaga } from "../../../credentialsCatalogue/saga";
import { checkHasNfcFeatureSaga } from "../../../identification/common/saga";
import { watchItwLifecycleSaga } from "../../../lifecycle/saga";
import { checkCurrentWalletInstanceStateSaga } from "../../../lifecycle/saga/checkCurrentWalletInstanceStateSaga";
import { warmUpIntegrityServiceSaga } from "../../../lifecycle/saga/checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateSaga
} from "../../../lifecycle/saga/checkWalletInstanceStateSaga";
import {
  watchItwStatusListAuthenticatedSaga,
  watchItwStatusListSaga
} from "../../../statusList/saga";
import { checkFiscalCodeEnabledSaga } from "../../../trialSystem/saga/checkFiscalCodeIsEnabledSaga";
import { watchItwEnvironment } from "../environment";
import { watchItwOfflineAccess } from "../offlineAccess";

type TakeEffect = {
  payload: {
    pattern: (action: ReturnType<typeof setConnectionStatus>) => boolean;
  };
};

describe("watchItwSaga", () => {
  it("starts offline-safe watchers and waits for connectivity before Status List checks", () => {
    testSaga(watchItwSaga)
      .next()
      .fork(watchItwOfflineAccess)
      .next()
      .fork(watchItwEnvironment)
      .next()
      .fork(watchItwCredentialsSaga)
      .next()
      .fork(checkHasNfcFeatureSaga)
      .next()
      .call(handleItwCredentialsVaultMigrationSaga)
      .next()
      .call(handleItwCredentialsVaultCoherenceSaga)
      .next()
      .fork(handleWalletCredentialsRehydration)
      .next()
      .fork(handleWalletUnitAttestationsCleanUp)
      .next()
      .fork(updateNfcInfoTrackingProperties)
      .next()
      .fork(syncItwAnalyticsProperties)
      .next()
      .select(isConnectedSelector)
      .next(true)
      .fork(warmUpIntegrityServiceSaga)
      .next()
      .call(watchItwStatusListSaga)
      .next()
      .isDone();
  });
});

describe("watchItwAuthenticatedSaga", () => {
  it("stops after an inconsistent wallet instance", () => {
    testSaga(watchItwAuthenticatedSaga)
      .next()
      .next()
      .fork(watchItwLifecycleSaga)
      .next()
      .fork(watchItwCredentialsCatalogueSaga)
      .next()
      .fork(checkFiscalCodeEnabledSaga)
      .next()
      .fork(watchItwAnalyticsSaga)
      .next()
      .fork(watchItwStatusListAuthenticatedSaga)
      .next()
      .call(checkWalletInstanceInconsistencySaga)
      .next(false)
      .isDone();
  });

  it("checks wallet state and credential status assertions for a consistent wallet", () => {
    testSaga(watchItwAuthenticatedSaga)
      .next()
      .next()
      .fork(watchItwLifecycleSaga)
      .next()
      .fork(watchItwCredentialsCatalogueSaga)
      .next()
      .fork(checkFiscalCodeEnabledSaga)
      .next()
      .fork(watchItwAnalyticsSaga)
      .next()
      .fork(watchItwStatusListAuthenticatedSaga)
      .next()
      .call(checkWalletInstanceInconsistencySaga)
      .next(true)
      .call(checkWalletInstanceStateSaga)
      .next()
      .call(checkCurrentWalletInstanceStateSaga)
      .next()
      .call(checkCredentialsStatusAssertion)
      .next()
      .call(checkCredentialsBatchRefill)
      .next()
      .isDone();
  });
});

describe("waitForConnection", () => {
  it("continues immediately when already connected", () => {
    testSaga(waitForConnection)
      .next()
      .select(isConnectedSelector)
      .next(true)
      .isDone();
  });

  it("waits for a successful connection status", () => {
    testSaga(waitForConnection)
      .next()
      .select(isConnectedSelector)
      .next(false)
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "TAKE" });
        const takeEffect = effect as TakeEffect;
        expect(takeEffect.payload.pattern(setConnectionStatus(true))).toBe(
          true
        );
        expect(takeEffect.payload.pattern(setConnectionStatus(false))).toBe(
          false
        );
      })
      .next(setConnectionStatus(true))
      .isDone();
  });
});
