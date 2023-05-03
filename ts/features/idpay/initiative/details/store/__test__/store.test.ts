import { pot } from "@pagopa/ts-commons";
import { createStore } from "redux";
import {
  idpayInitiativeDetailsSelector,
  idpayOperationListSelector,
  idpayTimelineCurrentPageSelector,
  idpayTimelineIsLastPageSelector,
  idpayTimelineLastUpdateSelector
} from "..";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../../definitions/idpay/InitiativeDTO";
import { TimelineDTO } from "../../../../../../../definitions/idpay/TimelineDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../../definitions/idpay/TransactionOperationDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../actions";

const mockResponseSuccess: InitiativeDTO = {
  initiativeId: "123",
  status: StatusEnum.REFUNDABLE,
  endDate: new Date(),
  nInstr: 123
};

const mockFailure: NetworkError = {
  kind: "generic",
  value: new Error("401")
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
      brand: "VISA",
      operationType: TransactionOperationType.TRANSACTION,
      operationDate: new Date("2020-05-20T09:00:00.000Z"),
      amount: 100,
      accrued: 50,
      brandLogo: "https://www.google.com",
      maskedPan: "1234567890",
      circuitType: "CREDIT_CARD"
    }
  ],
  pageNo: 1,
  pageSize: 10,
  totalPages: 1,
  totalElements: 1
};
describe("test idpay timeline reducer and selectors", () => {
  it("should be pot.noneLoading after the first loading action dispatched, the selector will also return empty array on pot.none states", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        page: 0,
        pageSize: 10
      })
    );

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.noneLoading
    );
    expect(idpayOperationListSelector(store.getState())).toStrictEqual([]);
  });
  it("should be pot.isUpdating when requesting new pages", () => {
    const timeline = {
      lastUpdate: new Date(),
      operationList: [],
      pageNo: 1,
      pageSize: 10,
      totalElements: 100,
      totalPages: 10
    };
    const paginatedTimeline: { [page: number]: TimelineDTO } = {
      0: timeline
    };
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const state: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          initiative: {
            ...globalState.features.idPay.initiative,
            timeline: pot.some(paginatedTimeline)
          }
        }
      }
    };
    const store = createStore(appReducer, state as any);
    store.dispatch(
      idpayTimelinePageGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        page: 1,
        pageSize: 10
      })
    );
    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.someUpdating(paginatedTimeline, paginatedTimeline)
    );
  });
  it("should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 0
      })
    );

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.some({ 0: mockTimelineResponseSuccess })
    );
    expect(idpayOperationListSelector(store.getState())).toStrictEqual(
      mockTimelineResponseSuccess.operationList
    );
  });

  it("should be pot.noneError with the error, after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.request({ initiativeId: "6364fd4570fc881452fdaa2d" })
    );
    store.dispatch(idpayTimelinePageGet.failure(mockFailure));

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });
});

describe("test idpay timeline pagination reducer and selectors", () => {
  it("should merge the response with the previous one, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 0
      })
    );
    store.dispatch(
      idpayTimelinePageGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        page: 2
      })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 1
      })
    );
    const expectedResult = {
      0: mockTimelineResponseSuccess,
      1: mockTimelineResponseSuccess
    };
    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.some(expectedResult)
    );
    expect(idpayOperationListSelector(store.getState())).toStrictEqual([
      ...mockTimelineResponseSuccess.operationList,
      ...mockTimelineResponseSuccess.operationList
    ]);
  });
  it("should reset the timeline after the idpayTimelineGet.request action for page 0 ", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(
      idpayTimelinePageGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        page: 2
      })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 1
      })
    );
    store.dispatch(
      idpayTimelinePageGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        page: 0
      })
    );

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.noneLoading
    );
  });

  it("should be pot.noneError with the error, after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.request({
        initiativeId: "6364fd4570fc881452fdaa2d",
        page: 2
      })
    );
    store.dispatch(idpayTimelinePageGet.failure(mockFailure));

    expect(store.getState().features.idPay.initiative.timeline).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });

  it("should return isLastPage===true if the timeline has reached the end", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.success({
        page: 0,
        timeline: mockTimelineResponseSuccess
      })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        page: 1,
        timeline: { ...mockTimelineResponseSuccess, operationList: [] }
      })
    );
    // last call to API returns an empty operationList,
    // but increases the currentPage

    expect(idpayTimelineIsLastPageSelector(store.getState())).toStrictEqual(
      true
    );
  });

  it("should correctly return the page number", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 0
      })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 1
      })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 2
      })
    );

    expect(idpayTimelineCurrentPageSelector(store.getState())).toStrictEqual(2);
  });
  it("should return the lastUpdate on selector call", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 0
      })
    );
    store.dispatch(
      idpayTimelinePageGet.success({
        timeline: mockTimelineResponseSuccess,
        page: 1
      })
    );
    expect(idpayTimelineLastUpdateSelector(store.getState())).toStrictEqual(
      mockTimelineResponseSuccess.lastUpdate
    );
  });
});
