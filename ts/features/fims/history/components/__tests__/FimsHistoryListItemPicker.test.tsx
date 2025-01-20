import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { Access } from "../../../../../../definitions/fims_history/Access";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as FETCH_HOOKS from "../../../common/hooks";
import { FimsHistoryListItemPicker } from "../FimsHistoryListItemPicker";
import * as LIST_ITEMS from "../FimsHistoryListItems";

const mockServicePublic = { organization_name: "TEST" } as ServicePublic;
const mockAccess: Access = {
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
      .mockImplementation(() => pot.some(mockServicePublic));

    const component = renderComponent(mockAccess);
    expect(component).toMatchSnapshot();
  });
  it('should call the "successListItem" in case of (some)', () => {
    const testSuccessComponent = jest.fn(() => <></>);
    jest
      .spyOn(LIST_ITEMS, "FimsHistorySuccessListItem")
      .mockImplementation(testSuccessComponent);
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.some(mockServicePublic));

    renderComponent(mockAccess);
    const calls = testSuccessComponent.mock.calls as unknown as Array<
      Array<any>
    >;

    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);
    expect(calls[0][0]).toEqual({
      consent: mockAccess,
      serviceData: mockServicePublic
    });
  });
  it('should call the "successListItem" in case of (someLoading)', () => {
    const testSuccessComponent = jest.fn(() => <></>);

    jest
      .spyOn(LIST_ITEMS, "FimsHistorySuccessListItem")
      .mockImplementation(testSuccessComponent);
    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.someLoading(mockServicePublic));

    renderComponent(mockAccess);

    const calls = testSuccessComponent.mock.calls as unknown as Array<
      Array<any>
    >;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);
    expect(calls[0][0]).toEqual({
      consent: mockAccess,
      serviceData: mockServicePublic
    });
  });
  it('should call the "successListItem" in case of (someError)', () => {
    const testSuccessComponent = jest.fn(() => <></>);
    jest
      .spyOn(LIST_ITEMS, "FimsHistorySuccessListItem")
      .mockImplementation(testSuccessComponent);

    jest
      .spyOn(FETCH_HOOKS, "useAutoFetchingServiceByIdPot")
      .mockImplementation(() => pot.someError(mockServicePublic, new Error()));

    renderComponent(mockAccess);

    const calls = testSuccessComponent.mock.calls as unknown as Array<
      Array<any>
    >;
    expect(calls.length).toBe(1);
    expect(calls[0].length).toBe(2);

    expect(calls[0][0]).toEqual({
      consent: mockAccess,
      serviceData: mockServicePublic
    });
  });
});

const renderComponent = (item: Access) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () => <FimsHistoryListItemPicker item={item} />,
    "FIMS_HISTORY",
    {},
    createStore(appReducer, globalState as any)
  );
};
