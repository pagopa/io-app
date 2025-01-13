import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { createStore } from "redux";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { Access } from "../../../../../../definitions/fims_history/Access";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as FETCH_HOOKS from "../../../common/hooks";
import { FimsHistoryListItemPicker } from "../FimsHistoryListItemPicker";
import * as LIST_ITEMS from "../FimsHistoryListItems";

const mockServiceData = { organization_name: "TEST" } as ServicePublic;
const mockConsent: Access = {
  id: "TESTING",
  redirect: { display_name: "TESTING", uri: "TESTING" },
  service_id: "TESTING_SID",
  timestamp: new Date(0)
};

describe("FimsHistoryListItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot for a some state", () => {
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.some(mockServiceData));

    const component = renderComponent(mockConsent);
    expect(component).toMatchSnapshot();
  });
  it('should call the "successListItem" in case of (some)', () => {
    const testSuccessComponent = jest.fn(() => <></>);
    jest
      .spyOn(LIST_ITEMS, "FimsHistorySuccessListItem")
      .mockImplementation(testSuccessComponent);
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.some(mockServiceData));

    renderComponent(mockConsent);
    const calls = testSuccessComponent.mock.calls as unknown as Array<
      Array<any>
    >;

    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);
    expect(calls[0][0]).toEqual({
      consent: mockConsent,
      serviceData: mockServiceData
    });
  });
  it('should call the "successListItem" in case of (someLoading)', () => {
    const testSuccessComponent = jest.fn(() => <></>);

    jest
      .spyOn(LIST_ITEMS, "FimsHistorySuccessListItem")
      .mockImplementation(testSuccessComponent);
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.someLoading(mockServiceData));

    renderComponent(mockConsent);

    const calls = testSuccessComponent.mock.calls as unknown as Array<
      Array<any>
    >;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);
    expect(calls[0][0]).toEqual({
      consent: mockConsent,
      serviceData: mockServiceData
    });
  });
  it('should call the "successListItem" in case of (someError)', () => {
    const testSuccessComponent = jest.fn(() => <></>);
    jest
      .spyOn(LIST_ITEMS, "FimsHistorySuccessListItem")
      .mockImplementation(testSuccessComponent);

    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.someError(mockServiceData, new Error()));

    renderComponent(mockConsent);

    const calls = testSuccessComponent.mock.calls as unknown as Array<
      Array<any>
    >;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);

    expect(calls[0][0]).toEqual({
      consent: mockConsent,
      serviceData: mockServiceData
    });
  });
});

const renderComponent = (item: Access) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () => <FimsHistoryListItemPicker item={item} />,
    "DUMMY ROUTE",
    {},
    createStore(appReducer, globalState as any)
  );
};
