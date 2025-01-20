import React from "react";
import { createStore } from "redux";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { Access } from "../../../../../../definitions/fims_history/Access";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  FimsHistoryFailureListItem,
  FimsHistorySuccessListItem
} from "../FimsHistoryListItems";

const mockServicePublic = { organization_name: "TEST" } as ServicePublic;
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
      { consent: mockAccess, serviceData: mockServicePublic },
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
  | {
      consent: Access;
      serviceData: ServicePublic;
    }
  | {
      item: Access;
    };

const renderComponent = (
  componentProps: ListItemProps,
  Component: React.ComponentType<any>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () => <Component {...componentProps} />,
    "FIMS_HISTORY",
    {},
    createStore(appReducer, globalState as any)
  );
};
