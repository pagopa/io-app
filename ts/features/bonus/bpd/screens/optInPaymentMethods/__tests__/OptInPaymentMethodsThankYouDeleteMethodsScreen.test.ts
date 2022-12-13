import * as pot from "@pagopa/ts-commons/lib/pot";
import { RenderAPI } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { deleteAllPaymentMethodsByFunction } from "../../../../../../store/actions/wallet/delete";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { WalletsState } from "../../../../../../store/reducers/wallet/wallets";
import * as showToast from "../../../../../../utils/showToast";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import {
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../model/RemoteValue";
import { bpdUpdateOptInStatusMethod } from "../../../store/actions/onboarding";
import OptInPaymentMethodsThankYouDeleteMethodsScreen from "../OptInPaymentMethodsThankYouDeleteMethodsScreen";

const loadingCases: ReadonlyArray<
  [
    deletePaymentMethodsStatus: WalletsState["deleteAllByFunction"],
    optInStatus: pot.Pot<CitizenOptInStatusEnum, Error>
  ]
> = [
  [remoteUndefined, pot.none],
  [remoteUndefined, pot.noneLoading],
  [remoteUndefined, pot.noneUpdating(CitizenOptInStatusEnum.DENIED)],
  [remoteUndefined, pot.noneError(new Error())],
  [remoteUndefined, pot.some(CitizenOptInStatusEnum.DENIED)],
  [remoteUndefined, pot.someLoading(CitizenOptInStatusEnum.DENIED)],
  [
    remoteUndefined,
    pot.someUpdating(
      CitizenOptInStatusEnum.NOREQ,
      CitizenOptInStatusEnum.DENIED
    )
  ],
  [remoteUndefined, pot.someError(CitizenOptInStatusEnum.DENIED, new Error())],
  [remoteLoading, pot.none],
  [remoteLoading, pot.noneLoading],
  [remoteLoading, pot.noneUpdating(CitizenOptInStatusEnum.DENIED)],
  [remoteLoading, pot.noneError(new Error())],
  [remoteLoading, pot.some(CitizenOptInStatusEnum.DENIED)],
  [remoteLoading, pot.someLoading(CitizenOptInStatusEnum.DENIED)],
  [
    remoteLoading,
    pot.someUpdating(
      CitizenOptInStatusEnum.NOREQ,
      CitizenOptInStatusEnum.DENIED
    )
  ],
  [remoteLoading, pot.someError(CitizenOptInStatusEnum.DENIED, new Error())],
  [remoteReady({ deletedMethodsCount: 1 }), pot.none],
  [remoteReady({ deletedMethodsCount: 1 }), pot.noneLoading],
  [
    remoteReady({ deletedMethodsCount: 1 }),
    pot.noneUpdating(CitizenOptInStatusEnum.DENIED)
  ],
  [
    remoteReady({ deletedMethodsCount: 1 }),
    pot.someLoading(CitizenOptInStatusEnum.DENIED)
  ],
  [
    remoteReady({ deletedMethodsCount: 1 }),
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
describe("the OptInPaymentMethodsThankYouDeleteMethodsScreen screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  test.each(loadingCases)(
    "Should render the loading component if delete payment methods status is %p and the opt-in status is %p",
    (deleteAllByFunction, optInStatus) => {
      const loadingState: GlobalState = {
        ...globalState,
        wallet: {
          ...globalState.wallet,
          wallets: {
            ...globalState.wallet.wallets,
            deleteAllByFunction
          }
        },
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
  it("Should render the RetryAfterDeletionFailsComponent if the delete payment methods status is error", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    store.dispatch(
      deleteAllPaymentMethodsByFunction.failure({ error: new Error() })
    );

    expect(
      component.getByTestId("RetryAfterDeletionFailsComponent")
    ).toBeDefined();
  });
  it("Should call the showToast and the optInPaymentMethodsCompleted functions if the delete payment methods status is ready and the opt-in status is error", () => {
    const showToastSpy = jest.spyOn(showToast, "showToast");
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );

    store.dispatch(
      deleteAllPaymentMethodsByFunction.success({
        wallets: [],
        deletedMethodsCount: 0
      })
    );
    store.dispatch(bpdUpdateOptInStatusMethod.failure(new Error()));
    renderComponent(store);
    expect(showToastSpy).toBeCalledTimes(1);
  });
  it("Should render the ThankYouSuccessComponent if the delete payment methods status is ready and the opt-in status is some", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    store.dispatch(
      deleteAllPaymentMethodsByFunction.success({
        wallets: [],
        deletedMethodsCount: 0
      })
    );
    store.dispatch(
      bpdUpdateOptInStatusMethod.success(CitizenOptInStatusEnum.DENIED)
    );
    expect(component.getByTestId("ThankYouSuccessComponent")).toBeDefined();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    OptInPaymentMethodsThankYouDeleteMethodsScreen,
    ROUTES.MAIN,
    {},
    store
  );
}
