import { ComponentProps } from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../OperationResultScreenContent";

const defaultProps: OperationResultScreenContentProps = {
  pictogram: "umbrella",
  title: "title",
  subtitle: "subtitle",
  action: {
    onPress: jest.fn(),
    label: "Action",
    accessibilityLabel: "Action"
  },
  secondaryAction: {
    onPress: jest.fn(),
    label: "Secondary Action",
    accessibilityLabel: "Secondary Action"
  }
};

describe("OperationResultScreenContent", () => {
  it("should match the snapshot with default props", () => {
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
});

function renderComponent(
  props: ComponentProps<typeof OperationResultScreenContent>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <OperationResultScreenContent {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
