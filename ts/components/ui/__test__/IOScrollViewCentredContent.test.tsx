import React, { ComponentProps } from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { IOScrollViewCentredContent } from "../IOScrollViewCentredContent";

const defaultProps: IOScrollViewCentredContent = {
  title: "This is a title",
  description: "This is a description",
  pictogram: "success",
  actions: {
    type: "TwoButtons",
    primary: {
      label: "primaryButton",
      testID: "primaryButtonTestId",
      onPress: () => undefined
    },
    secondary: {
      label: "actionButton",
      testID: "actionButtonTestId",
      onPress: () => undefined
    }
  }
};

describe("IOScrollViewCentredContent", () => {
  it("should render the component correctly", () => {
    const component = renderComponent(defaultProps);

    expect(component.queryByText(defaultProps.title));
    expect(component.queryByText(defaultProps.description!));
    expect(component.queryByTestId("primaryButtonTestId"));
    expect(component.queryByTestId("actionButtonTestId"));
  });
});

function renderComponent(
  props: ComponentProps<typeof IOScrollViewCentredContent>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <IOScrollViewCentredContent {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
