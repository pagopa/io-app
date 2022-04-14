import { fireEvent, render } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import * as React from "react";
import { Provider } from "react-redux";
import EycaDetailComponent from "../EycaDetailComponent";
import { EycaCard } from "../../../../../../../../definitions/cgn/EycaCard";
import { StatusEnum as AcivatedStatus } from "../../../../../../../../definitions/cgn/CardActivated";
import { StatusEnum as PendingStatus } from "../../../../../../../../definitions/cgn/CardPending";
import { CcdbNumber } from "../../../../../../../../definitions/cgn/CcdbNumber";
import { CgnEycaActivationStatus } from "../../../../store/reducers/eyca/activation";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../../i18n";
import * as urlUtils from "../../../../../../../utils/url";
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

describe("EycaDetailComponent", () => {
  jest.useFakeTimers();
  it("Should show EYCA Status component for an Active card", () => {
    const store = mockEYCAState(eycaCardActive);
    const component = getComponent(store);
    expect(component).not.toBeNull();

    const eycaNumber = component.queryByTestId("eyca-card-number");
    expect(eycaNumber).not.toBeNull();
    expect(eycaNumber).toHaveTextContent(eycaCardActive.card_number);

    const eycaStatusBadge = component.queryByTestId("eyca-status-badge");
    expect(eycaStatusBadge).not.toBeNull();
    expect(eycaStatusBadge).toHaveStyle({ backgroundColor: IOColors.aqua });

    const eycaStatusLabel = component.queryByTestId("eyca-status-label");
    expect(eycaStatusLabel).not.toBeNull();
    expect(eycaStatusLabel).toHaveStyle({ color: IOColors.bluegreyDark });
    expect(eycaStatusLabel).toHaveTextContent(
      I18n.t("bonus.cgn.detail.status.badge.active")
    );

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

    const pendingButton = component.queryByTestId("eyca-pending-button");
    expect(pendingButton).not.toBeNull();

    const spy = jest.spyOn(urlUtils, "openWebUrl");

    if (pendingButton !== null) {
      fireEvent.press(pendingButton);
      expect(spy).toHaveBeenCalledTimes(1);
    }
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

    const pendingButton = component.queryByTestId("eyca-pending-button");
    expect(pendingButton).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).not.toBeNull();

    const errorComponentText = component.queryByTestId("eyca-error-text");
    expect(errorComponentText).not.toBeNull();
    expect(errorComponentText).toHaveTextContent(
      I18n.t("bonus.cgn.detail.status.eycaError")
    );
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

    const pendingButton = component.queryByTestId("eyca-pending-button");
    expect(pendingButton).toBeNull();

    const errorComponent = component.queryByTestId("eyca-error-component");
    expect(errorComponent).not.toBeNull();

    const errorComponentText = component.queryByTestId("eyca-error-text");
    expect(errorComponentText).not.toBeNull();
    expect(errorComponentText).toHaveTextContent(
      I18n.t("bonus.cgn.detail.status.eycaError")
    );
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
