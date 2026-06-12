jest.mock("../FimsHistoryListItems.tsx");
jest.mock("../FimsHistoryLoaders.tsx");

import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { Access } from "../../../../../../definitions/fims_history/Access";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as LIST_ITEMS from "../FimsHistoryListItems";
import * as FETCH_HOOKS from "../../../common/hooks";
import { FimsHistoryListItemPicker } from "../FimsHistoryListItemPicker";
import { FIMS_ROUTES } from "../../../common/navigation";
import * as LOADERS from "../FimsHistoryLoaders";

const mockServiceDetails = { organization: { name: "TEST" } } as ServiceDetails;
const mockAccess: Access = {
  id: "TESTING",
  redirect: { display_name: "TESTING", uri: "TESTING" },
  service_id: "TESTING_SID",
  timestamp: new Date(0)
};

describe("FimsHistoryListItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should call the "successListItem" in case of (some)', () => {
    const testSuccessComponent = jest.spyOn(
      LIST_ITEMS,
      "FimsHistorySuccessListItem"
    );
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.some(mockServiceDetails));

    const component = renderComponent(mockAccess);
    const calls = testSuccessComponent.mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);
    expect(calls[0][0]).toEqual({
      consent: mockAccess,
      serviceData: mockServiceDetails
    });
    expect(component.toJSON()).toMatchSnapshot();
  });
  it('should call the "successListItem" in case of (someLoading)', () => {
    const testSuccessComponent = jest.spyOn(
      LIST_ITEMS,
      "FimsHistorySuccessListItem"
    );
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.someLoading(mockServiceDetails));

    const component = renderComponent(mockAccess);

    const calls = testSuccessComponent.mock.calls;

    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);
    expect(calls[0][0]).toEqual({
      consent: mockAccess,
      serviceData: mockServiceDetails
    });
    expect(component.toJSON()).toMatchSnapshot();
  });
  it('should call the "successListItem" in case of (someError)', () => {
    const testSuccessComponent = jest.spyOn(
      LIST_ITEMS,
      "FimsHistorySuccessListItem"
    );

    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.someError(mockServiceDetails, new Error()));

    const component = renderComponent(mockAccess);

    const calls = testSuccessComponent.mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);

    expect(calls[0][0]).toEqual({
      consent: mockAccess,
      serviceData: mockServiceDetails
    });
    expect(component.toJSON()).toMatchSnapshot();
  });
  it('should call the "failureListItem" in case of (noneError)', () => {
    const testFailureComponent = jest.spyOn(
      LIST_ITEMS,
      "FimsHistoryFailureListItem"
    );

    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.noneError(new Error()));

    const component = renderComponent(mockAccess);

    const calls = testFailureComponent.mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);

    expect(calls[0][0]).toEqual({
      item: mockAccess
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  const states = [
    pot.noneLoading,
    pot.noneUpdating(mockServiceDetails),
    pot.none,
    pot.someUpdating(mockServiceDetails, mockServiceDetails)
  ];

  it.each(states)(
    "should render the LoadingListItem in the %p state",
    mockState => {
      const testLoadingComponent = jest.spyOn(
        LOADERS,
        "LoadingFimsHistoryListItem"
      );
      jest
        .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
        .mockImplementation(() => mockState);

      const component = renderComponent(mockAccess);
      expect(testLoadingComponent).toHaveBeenCalledTimes(1);

      expect(component.toJSON()).toMatchSnapshot();
    }
  );
});

const renderComponent = (item: Access) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () => <FimsHistoryListItemPicker item={item} />,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, globalState as any)
  );
};
