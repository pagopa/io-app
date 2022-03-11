import { createStore, Store } from "redux";

import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import ROUTES from "../../../../../../navigation/routes";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as optInPaymentMethodsActions from "../../../store/actions/optInPaymentMethods";
import ThankYouSuccessComponent from "../ThankYouSuccessComponent";

jest.useFakeTimers();

describe("the ThankYouSuccessComponent screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("Should call the optInPaymentMethodsCompleted functions when the goToWalletButton is pressed", () => {
    const optInPaymentMethodsCompletedSpy = jest.spyOn(
      optInPaymentMethodsActions,
      "optInPaymentMethodsCompleted"
    );
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    fireEvent.press(component.getByTestId("goToWalletButton"));
    expect(optInPaymentMethodsCompletedSpy).toBeCalledTimes(1);
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    ThankYouSuccessComponent,
    ROUTES.MAIN,
    {},
    store
  );
}
