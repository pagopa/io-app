jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  Divider: jest.fn(() => <></>)
}));

import { Divider } from "@pagopa/io-app-design-system";
import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FIMS_ROUTES } from "../../../common/navigation";
import {
  LoadingFimsHistoryItemsFooter,
  LoadingFimsHistoryListItem
} from "../FimsHistoryLoaders";

describe("fimsHistoryItemsFooter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it.each([
    [true, 1],
    [false, 0],
    [undefined, 0]
  ])(
    "should match snapshot for show first divider == %s , and render the divider %s time(s)",
    (showDivider, renderTimes) => {
      const component = renderComponent(
        <LoadingFimsHistoryItemsFooter showFirstDivider={showDivider} />
      );
      expect(component.toJSON()).toMatchSnapshot();
      expect(Divider).toHaveBeenCalledTimes(renderTimes);
    }
  );
});

describe("loadingFimsHistoryItem", () => {
  it("should match snapshot", () => {
    const component = renderComponent(<LoadingFimsHistoryListItem />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (Component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () => Component,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, globalState as any)
  );
};
