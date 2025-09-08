import { render } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import I18n from "i18next";
import EycaDetailComponent from "../EycaDetailComponent";
import { EycaCard } from "../../../../../../../../definitions/cgn/EycaCard";
import { StatusEnum as AcivatedStatus } from "../../../../../../../../definitions/cgn/CardActivated";
import { StatusEnum as PendingStatus } from "../../../../../../../../definitions/cgn/CardPending";
import { CcdbNumber } from "../../../../../../../../definitions/cgn/CcdbNumber";
import { CgnEycaActivationStatus } from "../../../../store/reducers/eyca/activation";
import { appReducer } from "../../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { cgnEycaStatus } from "../../../../store/actions/eyca/details";

const eycaCardActive: EycaCard = {
  status: AcivatedStatus.ACTIVATED,
  card_number: "W413-K096-O814-Z223" as CcdbNumber,
  activation_date: new Date(Date.now()),
  expiration_date: new Date(Date.now() + 500000)
};

const eycaCardPending: EycaCard = {
  status: PendingStatus.PENDING
};

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest
    .fn()
    .mockReturnValue({ top: 20, left: 0, right: 0, bottom: 0 })
}));

describe("EycaDetailComponent", () => {
  jest.useFakeTimers();
  it("Should show EYCA Status component for an Active card", () => {
    const store = mockEYCAState(eycaCardActive);
    const component = getComponent(store);
    expect(component).not.toBeNull();

    const eycaNumber = component.queryByTestId("eyca-card-number");
    expect(eycaNumber).not.toBeNull();
    const eycaNumberText = component.queryByText(eycaCardActive.card_number);
    expect(eycaNumberText).not.toBeNull();

    const eycaStatusBadge = component.queryByTestId("eyca-status-badge");
    expect(eycaStatusBadge).not.toBeNull();

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).toBeNull();
  });

  it("Should show EYCA Pending component for a Pending card", () => {
    const store = mockEYCAState(eycaCardPending, "PROCESSING");
    const component = getComponent(store);
    expect(component).not.toBeNull();

    const eycaNumber = component.queryByTestId("eyca-card-number");
    expect(eycaNumber).toBeNull();

    const eycaStatusBadge = component.queryByTestId("eyca-status-badge");
    expect(eycaStatusBadge).toBeNull();

    const eycaStatusLabel = component.queryByTestId("eyca-status-label");
    expect(eycaStatusLabel).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).toBeNull();

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).not.toBeNull();
  });

  it("Should show EYCA Error component if a card is Pending but activation is in error", () => {
    const store = mockEYCAState(eycaCardPending, "ERROR");
    const component = getComponent(store);
    expect(component).not.toBeNull();

    const eycaNumber = component.queryByTestId("eyca-card-number");
    expect(eycaNumber).toBeNull();

    const eycaStatusBadge = component.queryByTestId("eyca-status-badge");
    expect(eycaStatusBadge).toBeNull();

    const eycaStatusLabel = component.queryByTestId("eyca-status-label");
    expect(eycaStatusLabel).toBeNull();

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).not.toBeNull();
    const errorComponentText = component.queryByText(
      I18n.t("bonus.cgn.detail.status.eycaError")
    );
    expect(errorComponentText).not.toBeNull();
  });

  it("Should show EYCA Error component if a card is not available", () => {
    const store = mockEYCAState();
    const component = getComponent(store);
    expect(component).not.toBeNull();

    const eycaNumber = component.queryByTestId("eyca-card-number");
    expect(eycaNumber).toBeNull();

    const eycaStatusBadge = component.queryByTestId("eyca-status-badge");
    expect(eycaStatusBadge).toBeNull();

    const eycaStatusLabel = component.queryByTestId("eyca-status-label");
    expect(eycaStatusLabel).toBeNull();

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).not.toBeNull();
    const errorComponentText = component.queryByText(
      I18n.t("bonus.cgn.detail.status.eycaError")
    );
    expect(errorComponentText).not.toBeNull();
  });
});

const mockEYCAState = (
  card?: EycaCard,
  activation?: CgnEycaActivationStatus
) => {
  // eslint-disable-next-line functional/no-let
  let globalState = appReducer(undefined, applicationChangeState("active"));
  if (card) {
    globalState = appReducer(
      globalState,
      cgnEycaStatus.success({ status: "FOUND", card })
    );
  }
  if (activation) {
    globalState = appReducer(
      globalState,
      cgnEycaActivation.success(activation)
    );
  }
  const mockStore = configureMockStore<GlobalState>();
  return mockStore({
    ...globalState
  } as GlobalState);
};

const getComponent = (store: any) =>
  render(
    <Provider store={store}>
      <EycaDetailComponent />
    </Provider>
  );
