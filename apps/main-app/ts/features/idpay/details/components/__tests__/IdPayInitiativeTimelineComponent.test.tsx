import { OperationListDTO } from "@io-app/api-types/generated/definitions/idpay/OperationListDTO";
import { TimelineDTO } from "@io-app/api-types/generated/definitions/idpay/TimelineDTO";
import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { trackIDPayDetailTimelineError } from "../../analytics";
import { IDPayDetailsRoutes } from "../../navigation";
import { PaginatedTimelineDTO } from "../../store";
import { IdPayInitiativeTimelineComponent } from "../IdPayInitiativeTimelineComponent";

const mockedTimeline: PaginatedTimelineDTO = {
  0: {
    lastUpdate: new Date(),
    operationList: [] as ReadonlyArray<OperationListDTO>,
    pageNo: 1,
    pageSize: 5,
    totalElements: 50,
    totalPages: 10
  } as TimelineDTO
};

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackIDPayDetailTimelineError: jest.fn()
}));

const mockedError: NetworkError = { kind: "timeout" };

describe("Test IdPayInitiativeTimelineComponent screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  it("should render the component correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
  });
  it("should render the skeleton with pot.Loading", () => {
    const { component } = renderComponent(pot.noneLoading);
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("IDPayEmptyTimelineTestID")).toBeNull();
    expect(component.queryByTestId("IDPayTimelineTestID")).not.toBeNull();
    expect(
      component.queryByTestId("IDPayTimelineSkeletonTestID")
    ).not.toBeNull();
  });
  it("should render the empty view with pot.None", () => {
    const { component } = renderComponent(pot.none);
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("IDPayEmptyTimelineTestID")).not.toBeNull();
    expect(component.queryByTestId("IDPayTimelineTestID")).not.toBeNull();
    expect(component.queryByTestId("IDPayTimelineSkeletonTestID")).toBeNull();
  });
  it("should render the list with pot.Some", () => {
    const { component } = renderComponent(pot.some(mockedTimeline));
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("IDPayEmptyTimelineTestID")).not.toBeNull();
    expect(component.queryByTestId("IDPayTimelineTestID")).not.toBeNull();
    expect(component.queryByTestId("IDPayTimelineSkeletonTestID")).toBeNull();
  });

  it.each([
    { name: "noneError", timelinePot: pot.noneError(mockedError) },
    {
      name: "someError",
      timelinePot: pot.someError(mockedTimeline, mockedError)
    }
  ])(
    "should track IDPAY_DETAIL_TIMELINE_ERROR with pot.$name",
    ({ timelinePot }) => {
      renderComponent(timelinePot);
      expect(trackIDPayDetailTimelineError).toHaveBeenCalledTimes(1);
      expect(trackIDPayDetailTimelineError).toHaveBeenCalledWith({
        initiative_id: "ABC",
        error: mockedError
      });
    }
  );

  it.each([
    { name: "none", timelinePot: pot.none },
    { name: "noneLoading", timelinePot: pot.noneLoading },
    { name: "some", timelinePot: pot.some(mockedTimeline) }
  ])(
    "should not track IDPAY_DETAIL_TIMELINE_ERROR with pot.$name",
    ({ timelinePot }) => {
      renderComponent(timelinePot);
      expect(trackIDPayDetailTimelineError).not.toHaveBeenCalled();
    }
  );
});

const renderComponent = (
  timelinePot: pot.Pot<PaginatedTimelineDTO, NetworkError> = pot.none
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        initiative: {
          ...globalState.features.idPay.initiative,
          timeline: timelinePot
        }
      }
    }
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <IdPayInitiativeTimelineComponent initiativeId="ABC" />,
      IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
      {},
      store
    ),
    store
  };
};
