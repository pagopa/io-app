import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { MessageDetailsSkeleton } from "../MessageDetailsSkeleton";

describe("MessageDetailsSkeleton", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should be announced as a single loading element", () => {
    const component = renderComponent();
    const loadingElement = component.getByTestId(
      "message-details-skeleton-loading"
    );
    expect(loadingElement.props.accessible).toBe(true);
    expect(loadingElement.props.accessibilityLabel).toBe(
      I18n.t("messageDetails.loadingText")
    );
    expect(loadingElement.props.accessibilityHint).toBe(
      I18n.t("messageDetails.pleaseWait")
    );
  });
});

const renderComponent = () => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  return renderScreenWithNavigationStoreContext(
    MessageDetailsSkeleton,
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    {},
    store
  );
};
