import React from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { WizardScreen, WizardScreenProps } from "../WizardScreen";

const defaultProps: WizardScreenProps = {
  title: "title",
  description: "description",
  pictogram: "abacus",
  primaryButton: {
    label: "primaryButton",
    accessibilityLabel: "accessible primaryButton",
    testID: "primaryButtonTestId",
    onPress: () => undefined
  },
  actionButton: {
    label: "actionButton",
    accessibilityLabel: "accessible actionButton",
    testID: "actionButtonTestId",
    onPress: () => undefined
  },
  goBack: () => undefined
};

describe("WizardScreen", () => {
  it("should match the snapshot with default props", () => {
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
});

function renderComponent(props: React.ComponentProps<typeof WizardScreen>) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState>(
    () => <WizardScreen {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
