import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import React from "react";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ItwActivationSuccessFeedbackBanner from "../ItwActivationSuccessFeedbackBanner";

describe("ItwActivationSuccessFeedbackBanner", () => {
  it("renders the banner", () => {
    const { getByTestId } = renderComponent();
    expect(
      getByTestId("itwActivationSuccessFeedbackBannerTestID")
    ).toBeTruthy();
  });

  it("hides the banner when the close button is pressed", () => {
    const { getByTestId, getByLabelText, queryByTestId } = renderComponent();
    expect(
      getByTestId("itwActivationSuccessFeedbackBannerTestID")
    ).toBeTruthy();

    fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));
    expect(
      queryByTestId("itwActivationSuccessFeedbackBannerTestID")
    ).toBeNull();
  });

  test.each([
    { docStatus: "active" as const, authMethod: "cieidL3" },
    { docStatus: "not_active" as const, authMethod: "ciepin" },
    { docStatus: "not_active" as const, authMethod: "spid" }
  ])(
    "renders correctly with docStatus=$docStatus and authMethod=$authMethod",
    ({ docStatus, authMethod }) => {
      const component = renderComponent({ docStatus, authMethod });
      expect(component).toMatchSnapshot();
    }
  );
});

const renderComponent = (
  props: Partial<
    React.ComponentProps<typeof ItwActivationSuccessFeedbackBanner>
  > = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const Component = () => (
    <ItwActivationSuccessFeedbackBanner
      authMethod={props.authMethod ?? "spid"}
      docStatus={props.docStatus ?? "not_active"}
      style={{ marginVertical: 8 }}
    />
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    Component,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
