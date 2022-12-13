import * as pot from "@pagopa/ts-commons/lib/pot";
import { RenderAPI } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as showToast from "../../../../../../utils/showToast";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { bpdUpdateOptInStatusMethod } from "../../../store/actions/onboarding";
import OptInPaymentMethodsThankYouKeepMethodsScreen from "../OptInPaymentMethodsThankYouKeepMethodsScreen";

const loadingCases: ReadonlyArray<
  [optInStatus: pot.Pot<CitizenOptInStatusEnum, Error>]
> = [
  [pot.none],
  [pot.noneLoading],
  [pot.noneUpdating(CitizenOptInStatusEnum.DENIED)],
  [pot.someLoading(CitizenOptInStatusEnum.DENIED)],
  [
    pot.someUpdating(
      CitizenOptInStatusEnum.NOREQ,
      CitizenOptInStatusEnum.DENIED
    )
  ]
];

jest.useFakeTimers();
jest.mock("../../../../../../utils/showToast", () => ({
  showToast: jest.fn()
}));
describe("the OptInPaymentMethodsThankYouKeepMethodsScreen screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  test.each(loadingCases)(
    "Should render the loading component if the opt-in status is %p",
    optInStatus => {
      const loadingState: GlobalState = {
        ...globalState,
        bonus: {
          ...globalState.bonus,
          bpd: {
            ...globalState.bonus.bpd,
            details: {
              ...globalState.bonus.bpd.details,
              activation: {
                ...globalState.bonus.bpd.details.activation,
                optInStatus
              }
            }
          }
        }
      };
      const store: Store<GlobalState> = createStore(
        appReducer,
        loadingState as any
      );
      const component: RenderAPI = renderComponent(store);
      expect(component.getByTestId("loadingComponent")).toBeDefined();
    }
  );
  it("Should call the showToast and the optInPaymentMethodsCompleted functions if the opt-in status is error", () => {
    const showToastSpy = jest.spyOn(showToast, "showToast");
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );

    store.dispatch(bpdUpdateOptInStatusMethod.failure(new Error()));
    renderComponent(store);
    expect(showToastSpy).toBeCalledTimes(1);
  });
  it("Should render the ThankYouSuccessComponent if the opt-in status is some", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    store.dispatch(
      bpdUpdateOptInStatusMethod.success(CitizenOptInStatusEnum.DENIED)
    );
    expect(component.getByTestId("ThankYouSuccessComponent")).toBeDefined();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    OptInPaymentMethodsThankYouKeepMethodsScreen,
    ROUTES.MAIN,
    {},
    store
  );
}
