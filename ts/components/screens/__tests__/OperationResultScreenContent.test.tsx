import React from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { OperationResultScreenContent } from "../OperationResultScreenContent";

const defaultProps: OperationResultScreenContent = {
  title: "title",
  subTitle: "subTitle",
  actionLabel: "actionLabel",
  actionAccessibilityLabel: "actionAccessibilityLabel",
  action: jest.fn()
};

describe("OperationResultScreenContent", () => {
  it("should match the snapshot with default props", () => {
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
});

function renderComponent(
  props: React.ComponentProps<typeof OperationResultScreenContent>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState>(
    () => <OperationResultScreenContent {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
