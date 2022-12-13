import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { CitizenOptInStatusEnum } from "../../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import {
  fetchWalletsFailure,
  fetchWalletsRequestWithExpBackoff,
  fetchWalletsSuccess
} from "../../../../../../../store/actions/wallet/wallets";
import {
  getBPDMethodsVisibleInWalletSelector,
  pagoPaCreditCardWalletV1Selector
} from "../../../../../../../store/reducers/wallet/wallets";
import { remoteReady, remoteUndefined } from "../../../../model/RemoteValue";
import {
  BpdActivationPayload,
  bpdLoadActivationStatus
} from "../../../../store/actions/details";
import { optInPaymentMethodsShowChoice } from "../../../../store/actions/optInPaymentMethods";
import {
  activationStatusSelector,
  optInStatusSelector
} from "../../../../store/reducers/details/activation";
import { optInShouldShowChoiceHandler } from "../optInShouldShowChoiceHandler";

const mockActivationStatus: BpdActivationPayload = {
  enabled: true,
  activationStatus: "never",
  payoffInstr: undefined,
  optInStatus: CitizenOptInStatusEnum.NOREQ
};

describe("optInShouldShowChoiceHandler saga", () => {
  jest.useFakeTimers();

  it("If bpdAllData fails, should dispatch the optInPaymentMethodsShowChoice.failure action and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.failure(new Error()))
      .put(optInPaymentMethodsShowChoice.failure(new Error()))
      .next()
      .isDone();
  });

  it("If bpdEnabled is not potSome, should dispatch the optInPaymentMethodsShowChoice.failure action and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.success(mockActivationStatus))
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
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.success(mockActivationStatus))
      .select(activationStatusSelector)
      .next(remoteReady("never"))
      .put(optInPaymentMethodsShowChoice.success(false))
      .next()
      .isDone();
  });

  it("If optInStatus is not potSome, should dispatch the optInPaymentMethodsShowChoice.failure action and return", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.success(mockActivationStatus))
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
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.success(mockActivationStatus))
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
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.success(mockActivationStatus))
      .select(activationStatusSelector)
      .next(remoteReady("subscribed"))
      .select(optInStatusSelector)
      .next(pot.some(CitizenOptInStatusEnum.NOREQ))
      .select(pagoPaCreditCardWalletV1Selector)
      .next(pot.none)
      .put(fetchWalletsRequestWithExpBackoff())
      .next()
      .take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)])
      .next(fetchWalletsFailure(new Error()))
      .put(optInPaymentMethodsShowChoice.failure(new Error()))
      .next()
      .isDone();
  });

  it("If fetchWallets succeed, should dispatch the optInPaymentMethodsShowChoice.success action", () => {
    testSaga(optInShouldShowChoiceHandler)
      .next()
      .select(activationStatusSelector)
      .next(remoteUndefined)
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(bpdLoadActivationStatus.success(mockActivationStatus))
      .select(activationStatusSelector)
      .next(remoteReady("subscribed"))
      .select(optInStatusSelector)
      .next(pot.some(CitizenOptInStatusEnum.NOREQ))
      .select(pagoPaCreditCardWalletV1Selector)
      .next(pot.none)
      .put(fetchWalletsRequestWithExpBackoff())
      .next()
      .take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)])
      .next(fetchWalletsSuccess([]))
      .select(getBPDMethodsVisibleInWalletSelector)
      .next([])
      .put(optInPaymentMethodsShowChoice.success(false))
      .next()
      .isDone();
  });
});
