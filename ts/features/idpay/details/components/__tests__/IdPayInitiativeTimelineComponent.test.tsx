import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IDPayDetailsRoutes } from "../../navigation";
import { PaginatedTimelineDTO } from "../../store";
import { IdPayInitiativeTimelineComponent } from "../IdPayInitiativeTimelineComponent";
import { TimelineDTO } from "../../../../../../definitions/idpay/TimelineDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";

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

describe("Test IdPayInitiativeTimelineComponent screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
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
