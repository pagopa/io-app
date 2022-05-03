import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import { bpdAllData } from "../../../../store/actions/details";
import {
  optInPaymentMethodsShowChoice,
  optInPaymentMethodsStart
} from "../../../../store/actions/optInPaymentMethods";
import { optInShouldShowChoiceHandler } from "../optInShouldShowChoiceHandler";
import {
  activationStatusSelector,
  optInStatusSelector
} from "../../../../store/reducers/details/activation";
import { CitizenOptInStatusEnum } from "../../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import {
  fetchWalletsFailure,
  fetchWalletsRequestWithExpBackoff,
  fetchWalletsSuccess
} from "../../../../../../../store/actions/wallet/wallets";
import { remoteReady, remoteUndefined } from "../../../../model/RemoteValue";

describe("optInShouldShowChoiceHandler saga", () => {
  jest.useFakeTimers();

  it("If bpdAllData fails, should dispatch the optInPaymentMethodsShowChoice.failure action and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.failure(new Error()))
      .put(optInPaymentMethodsShowChoice.failure(new Error()))
      .next()
      .isDone();
  });

  it("If bpdEnabled is not potSome, should dispatch the optInPaymentMethodsShowChoice.failure action and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.success())
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(
        optInPaymentMethodsShowChoice.failure(
          new Error("The bpdEnabled value is not potSome")
        )
      )
      .next()
      .isDone();
  });

  it("If bpdEnabled is potSome with the value false, should dispatch the optInPaymentMethodsShowChoice.success action with payload false and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.success())
      .select(activationStatusSelector)
      .next(remoteReady("never"))
      .put(optInPaymentMethodsShowChoice.success(false))
      .next()
      .isDone();
  });

  it("If optInStatus is not potSome, should dispatch the optInPaymentMethodsShowChoice.failure action and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.success())
      .select(activationStatusSelector)
      .next(remoteReady("subscribed"))
      .select(optInStatusSelector)
      .next(pot.none)
      .put(
        optInPaymentMethodsShowChoice.failure(
          new Error("The optInStatus value is not potSome")
        )
      )
      .next()
      .isDone();
  });

  it("If optInStatus is potSome with value different from NOREQ, should dispatch the optInPaymentMethodsShowChoice.success action with payload false and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.success())
      .select(activationStatusSelector)
      .next(remoteReady("subscribed"))
      .select(optInStatusSelector)
      .next(pot.some(CitizenOptInStatusEnum.DENIED))
      .put(optInPaymentMethodsShowChoice.success(false))
      .next()
      .isDone();
  });

  it("If fetchWallets fails, should dispatch the optInPaymentMethodsShowChoice.failure action", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.success())
      .select(activationStatusSelector)
      .next(remoteReady("subscribed"))
      .select(optInStatusSelector)
      .next(pot.some(CitizenOptInStatusEnum.NOREQ))
      .put(fetchWalletsRequestWithExpBackoff())
      .next()
      .take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)])
      .next(fetchWalletsFailure(new Error()))
      .put(optInPaymentMethodsShowChoice.failure(new Error()))
      .next()
      .isDone();
  });

  it("If fetchWallets succeed, should dispatch the optInPaymentMethodsShowChoice.success and the optInPaymentMethodsStart actions", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .put(bpdAllData.request())
      .next()
      .take([getType(bpdAllData.success), getType(bpdAllData.failure)])
      .next(bpdAllData.success())
      .select(activationStatusSelector)
      .next(remoteReady("subscribed"))
      .select(optInStatusSelector)
      .next(pot.some(CitizenOptInStatusEnum.NOREQ))
      .put(fetchWalletsRequestWithExpBackoff())
      .next()
      .take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)])
      .next(fetchWalletsSuccess([]))
      .put(optInPaymentMethodsShowChoice.success(true))
      .next()
      .put(optInPaymentMethodsStart())
      .next()
      .isDone();
  });
});
