import React from "react";
import { createStore } from "redux";

import { Access } from "../../../../../../definitions/fims_history/Access";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FIMS_ROUTES } from "../../../common/navigation";
import {
  FimsHistoryBaseListItemProps,
  FimsHistoryFailureListItem,
  FimsHistorySuccessListItem,
  FimsHistorySuccessListItemProps
} from "../FimsHistoryListItems";

const mockServiceDetails = { organization: { name: "TEST" } } as ServiceDetails;
const mockAccess: Access = {
  id: "TESTING",
  redirect: { display_name: "TESTING", uri: "TESTING" },
  service_id: "TESTING_SID",
  timestamp: new Date(0)
};

describe("FimsHistoryListItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should match snapshot for SuccessListItem", () => {
    const component = renderComponent(
      { consent: mockAccess, serviceData: mockServiceDetails },
      FimsHistorySuccessListItem
    );

    expect(component).toBeDefined();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for FailureListItem", () => {
    const component = renderComponent(
      { item: mockAccess },
      FimsHistoryFailureListItem
    );

    expect(component).toBeDefined();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

type ListItemProps =
  | FimsHistoryBaseListItemProps
  | FimsHistorySuccessListItemProps;
const renderComponent = (
  componentProps: ListItemProps,
  Component: React.ComponentType<any>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () => <Component {...componentProps} />,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, globalState as any)
  );
};
