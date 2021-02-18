import { none } from "fp-ts/lib/Option";
import * as React from "react";
import { createStore } from "redux";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import AddCardScreen, { NavigationParams } from "../AddCardScreen";

const mockPresentFn = jest.fn();
jest.mock("../../../utils/bottomSheet", () => ({
  __esModule: true,
  useIOBottomSheet: () => ({ present: mockPresentFn })
}));

jest.unmock("react-navigation");
jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("AddCardScreen", () => {
  beforeEach(() => jest.useFakeTimers());
  it("should show the continue button blocked if the aren't data", () => {
    const component = getComponent();
    const continueButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );
    expect(continueButton).not.toBeNull();
    expect(continueButton).toBeDisabled();
  });
});

const getComponent = () => {
  const params: NavigationParams = {
    inPayment: none
  } as NavigationParams;

  const ToBeTested: React.FunctionComponent<React.ComponentProps<
    typeof AddCardScreen
  >> = (props: React.ComponentProps<typeof AddCardScreen>) => (
    <AddCardScreen {...props} />
  );

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ToBeTested,
    ROUTES.WALLET_ADD_CARD,
    params,
    store
  );
};
