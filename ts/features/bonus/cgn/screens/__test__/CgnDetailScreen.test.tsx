import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import { Card } from "../../../../../../definitions/cgn/Card";
import { StatusEnum as ActivatedStatusEnum } from "../../../../../../definitions/cgn/CardActivated";
import { StatusEnum as ExpiredStatusEnum } from "../../../../../../definitions/cgn/CardExpired";
import {
  CardRevoked,
  StatusEnum as RevokedStatusEnum
} from "../../../../../../definitions/cgn/CardRevoked";
import { CcdbNumber } from "../../../../../../definitions/cgn/CcdbNumber";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { applicationChangeState } from "../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { useIODispatch } from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { getGenericError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import CGN_ROUTES from "../../navigation/routes";
import { cgnActivationStart } from "../../store/actions/activation";
import { cgnDetails } from "../../store/actions/details";
import { cgnEycaStatus } from "../../store/actions/eyca/details";
import CgnDetailScreen from "../CgnDetailScreen";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import * as urlUtils from "../../../../../utils/url";

jest.mock("../../components/CgnAnimatedBackground", () => ({
  CgnAnimatedBackground: () => null
}));

jest.mock("../../../../../utils/hooks/useOnFocus", () => ({
  useActionOnFocus: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: jest.fn().mockReturnValue(jest.fn())
}));

jest.mock("../../../../../hooks/useHardwareBackButton", () => ({
  useHardwareBackButton: jest.fn(),
  useHardwareBackButtonToDismiss: jest.fn().mockReturnValue({
    onOpen: jest.fn(),
    onClose: jest.fn()
  })
}));

const renderComponent = (state: GlobalState) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    CgnDetailScreen,
    CGN_ROUTES.DETAILS.DETAILS,
    {},
    createStore(appReducer, state as any)
  );

const buildBaseState = (cgnEnabled = true, card?: Card) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const stateWithBackendStatus = appReducer(
    initialState,
    backendStatusLoadSuccess({
      ...baseRawBackendStatus,
      config: {
        ...baseRawBackendStatus.config,
        cgn: { ...baseRawBackendStatus.config.cgn, enabled: cgnEnabled }
      }
    })
  );
  return card
    ? appReducer(stateWithBackendStatus, cgnDetails.success(card))
    : stateWithBackendStatus;
};

const activatedCard: Card = {
  status: ActivatedStatusEnum.ACTIVATED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const expiredCard: Card = {
  status: ExpiredStatusEnum.EXPIRED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2023-02-20")
};

const revokedCard: Card = {
  status: RevokedStatusEnum.REVOKED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20"),
  revocation_date: new Date("2024-01-01"),
  revocation_reason: "Some reason" as CardRevoked["revocation_reason"]
};

describe("CgnDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIODispatch as jest.Mock).mockReturnValue(jest.fn());
  });
  it("should render the error screen when cgn details request fails", () => {
    const state = appReducer(
      buildBaseState(),
      cgnDetails.failure(getGenericError(new Error("cgn error")))
    );
    const { getByText } = renderComponent(state);
    expect(getByText(I18n.t("wallet.methodDetails.error.title"))).toBeTruthy();
    expect(
      getByText(I18n.t("wallet.methodDetails.error.subtitle"))
    ).toBeTruthy();
  });

  it("should render the loading screen when cgn details are loading", () => {
    const state = appReducer(buildBaseState(), cgnDetails.request());
    const { getByTestId } = renderComponent(state);
    expect(getByTestId("BonusCardStatusSkeletonTestID")).toBeTruthy();
  });

  it("should render the empty state when there are no cgn details", () => {
    const state = buildBaseState();
    const { getByText } = renderComponent(state);
    expect(getByText(I18n.t("bonus.cgn.detail.empty.title"))).toBeTruthy();
    expect(getByText(I18n.t("bonus.cgn.detail.empty.subtitle"))).toBeTruthy();
  });

  it("should render the detail screen when card is activated", () => {
    const state = buildBaseState(true, activatedCard);
    const { getAllByText, getByText } = renderComponent(state);
    expect(getAllByText(I18n.t("bonus.cgn.name"))).toBeTruthy();
    expect(getByText(I18n.t("bonus.cgn.departmentName"))).toBeTruthy();
    const discountCTA = getByText(I18n.t("bonus.cgn.detail.cta.discover"));
    expect(discountCTA).toBeTruthy();
    fireEvent.press(discountCTA);
    // Merchant screen title used to verify that the navigation to the merchant screen is working 
    expect(getByText(I18n.t("bonus.cgn.merchantsList.screenTitle"))).toBeTruthy();
  });

  it("should render profile name on footer if provided", () => {
    const baseState = buildBaseState(true, activatedCard);
    const state = {
      ...baseState,
      profile: pot.some({
        name: "Mario",
        family_name: "Rossi"
      })
    } as GlobalState;
    const { getByText } = renderComponent(state);
    expect(getByText("Mario Rossi")).toBeTruthy();
  });

  it("should show expired alert when card is expired", () => {
    const state = buildBaseState(true, expiredCard);
    const { getByText } = renderComponent(state);
    expect(
      getByText(
        I18n.t("bonus.cgn.detail.information.expired", {
          date: formatDateAsShortFormat(expiredCard.expiration_date)
        })
      )
    ).toBeTruthy();
  });

  it("should show revoked alert when card is revoked", () => {
    const state = buildBaseState(true, revokedCard);
    const { getByText } = renderComponent(state);
    expect(
      getByText(
        I18n.t("bonus.cgn.detail.information.revoked", {
          reason: revokedCard.revocation_reason
        })
      )
    ).toBeTruthy();
  });

  it("should not show discover CTA when CGN is disabled", () => {
    const state = buildBaseState(false, activatedCard);
    const { queryByText } = renderComponent(state);
    expect(queryByText(I18n.t("bonus.cgn.detail.cta.discover"))).toBeNull();
  });

  it("should show discover Eyca CTA available", () => {
    const state = buildBaseState(true, activatedCard);
    const eycaState = appReducer(
      state,
      cgnEycaStatus.success({
        status: "FOUND",
        card: {
          activation_date: new Date("2020-03-04"),
          expiration_date: new Date("2037-02-20"),
          status: ActivatedStatusEnum.ACTIVATED,
          card_number: "W413-K096-O814-Z223" as CcdbNumber
        }
      })
    );
    const { getByText } = renderComponent(eycaState);
    expect(
      getByText(I18n.t("bonus.cgn.detail.cta.eyca.showEycaDiscounts"))
    ).toBeTruthy();
  });

  it("should called back action when hardware back button is pressed", () => {
    const state = buildBaseState(true, activatedCard);
    renderComponent(state);
    expect(useHardwareBackButton).toHaveBeenCalled();
  });

  it("should call load action on focus", () => {
    const mockDispatch = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(mockDispatch);

    const state = buildBaseState();
    const { getByText } = renderComponent(state);
    fireEvent.press(getByText(I18n.t("bonus.cgn.detail.empty.activateCta")));
    expect(mockDispatch).toHaveBeenCalledWith(loadAvailableBonuses.request());
    expect(mockDispatch).toHaveBeenCalledWith(cgnActivationStart());
  });

  it("should pass loadCGN to useActionOnFocus", () => {
    const mockDispatch = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(mockDispatch);

    const state = buildBaseState(true, activatedCard);
    renderComponent(state);

    expect(useActionOnFocus).toHaveBeenCalled();
    const loadCGN = (useActionOnFocus as jest.Mock).mock.calls[0][0];
    loadCGN();
    expect(mockDispatch).toHaveBeenCalledWith(cgnDetails.request());
    expect(mockDispatch).toHaveBeenCalledWith(cgnEycaStatus.request());
  });

  it("should call openWebUrl when EYCA discounts CTA is pressed", () => {
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation(jest.fn());

    const state = buildBaseState(true, activatedCard);
    const eycaState = appReducer(
      state,
      cgnEycaStatus.success({
        status: "FOUND",
        card: {
          activation_date: new Date("2020-03-04"),
          expiration_date: new Date("2037-02-20"),
          status: ActivatedStatusEnum.ACTIVATED,
          card_number: "W413-K096-O814-Z223" as CcdbNumber
        }
      })
    );
    const { getByText } = renderComponent(eycaState);
    const eycaButton = getByText(
      I18n.t("bonus.cgn.detail.cta.eyca.showEycaDiscounts")
    );
    fireEvent.press(eycaButton);

    expect(openWebUrlSpy).toHaveBeenCalled();
    openWebUrlSpy.mockRestore();
  });

  it("should dispatch loadCGN on retry when error screen is shown", () => {
    const mockDispatch = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(mockDispatch);

    const state = appReducer(
      buildBaseState(),
      cgnDetails.failure(getGenericError(new Error("cgn error")))
    );
    const { getByText } = renderComponent(state);
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(mockDispatch).toHaveBeenCalledWith(cgnDetails.request());
    expect(mockDispatch).toHaveBeenCalledWith(cgnEycaStatus.request());
  });
});
