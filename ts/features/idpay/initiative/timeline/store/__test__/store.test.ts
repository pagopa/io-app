import { pot } from "@pagopa/ts-commons";
import { createStore } from "redux";
import { idpayTimelineDetailsSelector } from "..";
import { TransactionDetailDTO } from "../../../../../../../InstrumentOperationDTO/../definitions/idpay/TransactionDetailDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../../definitions/idpay/TransactionOperationDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { NetworkError } from "../../../../../../utils/errors";
import { idpayTimelineDetailsGet } from "../actions";

const mockFailure: NetworkError = {
  kind: "generic",
  value: new Error("401")
};
const mockTransactionDetail: TransactionDetailDTO = {
  brand: "VISA",
  operationType: TransactionOperationType.TRANSACTION,
  operationDate: new Date(),
  amount: 100,
  brandLogo:
    "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
  circuitType: "01",
  maskedPan: "1234",
  operationId: "1",
  accrued: 100,
  idTrxAcquirer: "1",
  idTrxIssuer: "1",
  status: ""
};

describe("Test timeline operation details reducer", () => {
  it("should be pot.none before the first loading action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.idPay.timeline.details).toStrictEqual(pot.none);
    expect(idpayTimelineDetailsSelector(globalState)).toStrictEqual(pot.none);
  });

  it("should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelineDetailsGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        operationId: "1234567890"
      })
    );

    expect(store.getState().features.idPay.timeline.details).toStrictEqual(
      pot.noneLoading
    );
    expect(idpayTimelineDetailsSelector(store.getState())).toStrictEqual(
      pot.noneLoading
    );
  });

  it("should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelineDetailsGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        operationId: "1234567890"
      })
    );
    store.dispatch(idpayTimelineDetailsGet.success(mockTransactionDetail));

    expect(store.getState().features.idPay.timeline.details).toStrictEqual(
      pot.some(mockTransactionDetail)
    );
    expect(idpayTimelineDetailsSelector(store.getState())).toStrictEqual(
      pot.some(mockTransactionDetail)
    );
  });

  it("should be pot.noneError with the error, after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelineDetailsGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        operationId: "1234567890"
      })
    );
    store.dispatch(idpayTimelineDetailsGet.failure(mockFailure));

    expect(store.getState().features.idPay.timeline.details).toStrictEqual(
      pot.noneError(mockFailure)
    );
    expect(idpayTimelineDetailsSelector(store.getState())).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });
});
