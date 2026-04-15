import { fireEvent, render } from "@testing-library/react-native";
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

  it("Should dispatch cgnEycaActivation.request when retry is pressed on error", () => {
    const store = mockEYCAState(eycaCardPending, "ERROR");
    const component = getComponent(store);

    const retryButton = component.getByText(I18n.t("global.buttons.retry"));
    fireEvent.press(retryButton);

    expect(store.getActions()).toContainEqual(cgnEycaActivation.request());
  });

  it("Should show EYCA Error component if a card is Pending but activation is NOT_FOUND", () => {
    const store = mockEYCAState(eycaCardPending, "NOT_FOUND");
    const component = getComponent(store);

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).not.toBeNull();
  });

  it("Should show EYCA Error component if a card is Pending with no activation status", () => {
    const store = mockEYCAState(eycaCardPending);
    const component = getComponent(store);

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).not.toBeNull();
  });

  it("Should render null for an unknown card status", () => {
    const unknownCard = { status: "UNKNOWN_STATUS" } as unknown as EycaCard;
    const store = mockEYCAState(unknownCard);
    const component = getComponent(store);

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).toBeNull();

    const eycaNumber = component.queryByTestId("eyca-card-number");
    expect(eycaNumber).toBeNull();
  });

  it("Should show loading spinner when eyca activation is loading", () => {
    const store = mockEYCAState(eycaCardPending, undefined, true);
    const component = getComponent(store);

    const pendingComponent = component.queryByTestId("eyca-pending-component");
    expect(pendingComponent).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).toBeNull();
  });
});

const mockEYCAState = (
  card?: EycaCard,
  activation?: CgnEycaActivationStatus,
  activationLoading?: boolean
) => {
  // eslint-disable-next-line functional/no-let
  let globalState = appReducer(undefined, applicationChangeState("active"));
  if (card) {
    globalState = appReducer(
      globalState,
      cgnEycaStatus.success({ status: "FOUND", card })
    );
  }
  if (activationLoading) {
    globalState = appReducer(globalState, cgnEycaActivation.request());
  } else if (activation) {
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
