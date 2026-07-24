import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";

import { BonusAvailable } from "../../../../../../../definitions/content/BonusAvailable";
import { BonusVisibilityEnum } from "../../../../../../../definitions/content/BonusVisibility";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../../store/actions/backendStatus";
import { useIODispatch } from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { loadAvailableBonuses } from "../../../../common/store/actions/availableBonusesTypes";
import { ID_CGN_TYPE } from "../../../../common/utils";
import * as bonusUtils from "../../../../common/utils";
import CGN_ROUTES from "../../../navigation/routes";
import { cgnActivationStart } from "../../../store/actions/activation";
import CgnCTAStartOnboardingScreen from "../CgnCTAStartActivationScreen";

jest.spyOn(Alert, "alert");

jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIODispatch: jest.fn()
}));

jest.mock("../../../../../../utils/hooks/useOnFocus", () => ({
  useActionOnFocus: jest.fn()
}));

const renderComponent = (state: GlobalState) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    CgnCTAStartOnboardingScreen,
    CGN_ROUTES.ACTIVATION.CTA_START_CGN,
    {},
    createStore(appReducer, state as any)
  );

const buildState = (cgnEnabled: boolean) => {
  // eslint-disable-next-line functional/no-let
  let state = appReducer(undefined, applicationChangeState("active"));
  state = appReducer(
    state,
    backendStatusLoadSuccess({
      ...baseRawBackendStatus,
      config: {
        ...baseRawBackendStatus.config,
        cgn: { ...baseRawBackendStatus.config.cgn, enabled: cgnEnabled }
      }
    })
  );
  return state;
};

const mockCgnBonus: BonusAvailable = {
  id_type: ID_CGN_TYPE,
  is_active: true,
  visibility: BonusVisibilityEnum.visible,
  valid_from: new Date("2025-01-01T00:00:00.000Z"),
  valid_to: new Date("2027-01-01T00:00:00.000Z"),
  it: {
    name: "Carta Giovani Nazionale",
    title: "CGN title",
    subtitle: "CGN subtitle",
    content: "CGN content"
  },
  en: {
    name: "National Youth Card",
    title: "CGN title",
    subtitle: "CGN subtitle",
    content: "CGN content"
  }
};

const buildStateWithBonus = () => {
  const state = buildState(true);
  return {
    ...state,
    bonus: {
      ...state.bonus,
      availableBonusTypes: pot.some([mockCgnBonus])
    }
  } as GlobalState;
};

describe("CgnCTAStartOnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the loading screen when CGN is enabled", () => {
    const { getByText } = renderComponent(buildState(true));
    expect(getByText(I18n.t("global.remoteStates.loading"))).toBeTruthy();
  });

  it("should show alert when CGN is not enabled", () => {
    renderComponent(buildState(false));
    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("bonus.cgn.name"),
      I18n.t("bonus.state.completed.description")
    );
  });

  it("should not render the loading screen when CGN is not enabled", () => {
    const { queryByText } = renderComponent(buildState(false));
    expect(queryByText(I18n.t("global.remoteStates.loading"))).toBeNull();
  });

  it("should dispatch cgnActivationStart when bonus is available", () => {
    const dispatchMock = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(dispatchMock);

    jest
      .spyOn(bonusUtils, "mapBonusIdFeatureFlag")
      .mockImplementation(
        () => new Map<number, boolean>([[ID_CGN_TYPE, true]])
      );

    const state = buildStateWithBonus();
    renderComponent(state);

    expect(dispatchMock).toHaveBeenCalledWith(cgnActivationStart());
  });

  it("should render error screen when bonus loading fails", () => {
    const state = buildState(true);
    const errorState = appReducer(
      state,
      loadAvailableBonuses.failure(new Error("load error"))
    );
    const { getByText } = renderComponent(errorState);
    expect(getByText(I18n.t("global.genericError"))).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
  });

  it("should dispatch loadAvailableBonuses.request on retry press", () => {
    const dispatchMock = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(dispatchMock);

    const state = buildState(true);
    const errorState = appReducer(
      state,
      loadAvailableBonuses.failure(new Error("load error"))
    );
    const { getByText } = renderComponent(errorState);
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(dispatchMock).toHaveBeenCalledWith(loadAvailableBonuses.request());
  });
});
