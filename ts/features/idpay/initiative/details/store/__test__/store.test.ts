import { pot } from "@pagopa/ts-commons";
import { createStore } from "redux";
import {
  idpayInitiativeDetailsSelector,
  idpayTimelineDetailsSelector,
  idpayTimelineSelector
} from "..";
import { TimelineDTO } from "../../../../../../../definitions/idpay/timeline/TimelineDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { TransactionDetailDTO } from "../../../../../../../InstrumentOperationDTO/../definitions/idpay/timeline/TransactionDetailDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { NetworkError } from "../../../../../../utils/errors";
import {
  idpayInitiativeGet,
  idpayTimelineDetailsGet,
  idpayTimelineGet
} from "../actions";

const mockResponseSuccess: InitiativeDTO = {
  initiativeId: "123",
  status: StatusEnum.REFUNDABLE,
  endDate: new Date(),
  nInstr: 123
};

const mockFailure: NetworkError = {
  kind: "generic",
  value: new Error("response status code 401")
};

const mockTransactionDetail: TransactionDetailDTO = {
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
  idTrxIssuer: "1"
};

describe("Test IDPay initiative details reducers and selectors", () => {
  it("should be pot.none before the first loading action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.idPay.initiative.details).toStrictEqual(
      pot.none
    );
    expect(idpayInitiativeDetailsSelector(globalState)).toStrictEqual(pot.none);
  });

  it("should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayInitiativeGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );

    expect(store.getState().features.idPay.initiative.details).toStrictEqual(
      pot.noneLoading
    );
    expect(idpayInitiativeDetailsSelector(store.getState())).toStrictEqual(
      pot.noneLoading
    );
  });
  it("should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayInitiativeGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );
    store.dispatch(idpayInitiativeGet.success(mockResponseSuccess));

    expect(store.getState().features.idPay.initiative.details).toStrictEqual(
      pot.some(mockResponseSuccess)
    );
    expect(idpayInitiativeDetailsSelector(store.getState())).toStrictEqual(
      pot.some(mockResponseSuccess)
    );
  });

  it("should be pot.noneError with the error, after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayInitiativeGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );
    store.dispatch(idpayInitiativeGet.failure(mockFailure));

    expect(store.getState().features.idPay.initiative.details).toStrictEqual(
      pot.noneError(mockFailure)
    );
    expect(idpayInitiativeDetailsSelector(store.getState())).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });
});

const mockTimelineResponseSuccess: TimelineDTO = {
  // mock TimelineDTO
  lastUpdate: new Date("2020-05-20T09:00:00.000Z"),
  operationList: [
    {
      operationId: "1234567890",
      operationType: TransactionOperationType.TRANSACTION,
      operationDate: new Date("2020-05-20T09:00:00.000Z"),
      amount: 100,
      brandLogo: "https://www.google.com",
      maskedPan: "1234567890",
      circuitType: "CREDIT_CARD"
    }
  ]
};
describe("test idpay timeline reducer and selectors", () => {
  it("should be pot.none before the first loading action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.idPay.initiative.timeline).toStrictEqual(
      pot.none
    );
    expect(idpayTimelineSelector(globalState)).toStrictEqual(pot.none);
  });

  it("should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelineGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.noneLoading
    );
    expect(idpayTimelineSelector(store.getState())).toStrictEqual(
      pot.noneLoading
    );
  });
  it("should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelineGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );
    store.dispatch(idpayTimelineGet.success(mockTimelineResponseSuccess));

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.some(mockTimelineResponseSuccess)
    );
    expect(idpayTimelineSelector(store.getState())).toStrictEqual(
      pot.some(mockTimelineResponseSuccess)
    );
  });

  it("should be pot.noneError with the error, after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelineGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );
    store.dispatch(idpayTimelineGet.failure(mockFailure));

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.noneError(mockFailure)
    );
    expect(idpayTimelineSelector(store.getState())).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });
});

describe("Test timeline operation details reducer", () => {
  it("should be pot.none before the first loading action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.idPay.initiative.timelineDetails).toStrictEqual(
      pot.none
    );
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

    expect(
      store.getState().features.idPay.initiative.timelineDetails
    ).toStrictEqual(pot.noneLoading);
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

    expect(
      store.getState().features.idPay.initiative.timelineDetails
    ).toStrictEqual(pot.some(mockTransactionDetail));
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

    expect(
      store.getState().features.idPay.initiative.timelineDetails
    ).toStrictEqual(pot.noneError(mockFailure));
    expect(idpayTimelineDetailsSelector(store.getState())).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });
});
