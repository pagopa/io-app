import { act, fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert, AlertButton } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { DigitalCredentialsCatalogue } from "../../../common/utils/itwCredentialsCatalogueUtils";
import {
  itwFetchCatalogueTranslations,
  itwFetchCredentialsCatalogue
} from "../../../credentialsCatalogue/store/actions";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { selectCredentialType } from "../../../machine/credential/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialIntroductionScreen } from "../ItwIssuanceCredentialIntroductionScreen";

describe("ItwIssuanceCredentialIntroductionScreen", () => {
  const spyUseActorRef = jest.spyOn(
    ItwCredentialIssuanceMachineContext,
    "useActorRef"
  );
  const spyUseSelector = jest.spyOn(
    ItwCredentialIssuanceMachineContext,
    "useSelector"
  );
  const spyEidUseSelector = jest.spyOn(
    ItwEidIssuanceMachineContext,
    "useSelector"
  );
  const spyEidUseActorRef = jest.spyOn(
    ItwEidIssuanceMachineContext,
    "useActorRef"
  );
  const spyAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

  const mockSend = jest.fn();
  const mockEidSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    spyUseActorRef.mockReturnValue({
      send: mockSend
    } as any);
    spyEidUseActorRef.mockReturnValue({ send: mockEidSend } as any);
    // No credential type resolved yet in the machine context: renders the
    // generic error fallback, which is irrelevant to what these tests assert
    // (whether "select-credential" was sent on mount).
    spyUseSelector.mockReturnValue(undefined as any);
    // By default the eID machine was not started by a credential request
    spyEidUseSelector.mockReturnValue(undefined as any);
  });

  const renderComponent = (
    params?: { credentialType?: string; mode?: string },
    store = createStore(
      appReducer,
      appReducer(undefined, applicationChangeState("active")) as any
    )
  ) =>
    renderScreenWithNavigationStoreContext<GlobalState>(
      ItwIssuanceCredentialIntroductionScreen,
      ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION,
      params ?? {},
      store
    );

  it("sends select-credential when reached directly with a credentialType param", () => {
    renderComponent({ credentialType: "mDL" });

    expect(mockSend).toHaveBeenCalledWith({
      type: "select-credential",
      credentialType: "mDL",
      mode: "issuance"
    });
  });

  it("uses the given mode when reached directly with an explicit mode param", () => {
    renderComponent({ credentialType: "mDL", mode: "reissuance" });

    expect(mockSend).toHaveBeenCalledWith({
      type: "select-credential",
      credentialType: "mDL",
      mode: "reissuance"
    });
  });

  it("does not send select-credential when reached via the machine (no credentialType param)", () => {
    renderComponent();

    expect(mockSend).not.toHaveBeenCalled();
  });

  const catalogue: DigitalCredentialsCatalogue = {
    taxonomy_uri: "",
    exp: 1700000000,
    iat: 1600000000,
    credentials: [
      {
        credential_type: "mDL",
        authentic_sources: [
          {
            id: "source",
            organization_country: "IT",
            organization_type: "public",
            user_information: "Credential introduction"
          }
        ],
        issuers: [],
        legal_type: "public",
        purposes: [],
        validity_info: {
          allowed_states: [],
          max_validity_days: 365,
          status_methods: []
        },
        version: "1"
      }
    ]
  };

  test.each([
    {
      name: "catalogue",
      request: itwFetchCredentialsCatalogue.request(),
      success: itwFetchCredentialsCatalogue.success(catalogue)
    },
    {
      name: "translations",
      request: itwFetchCatalogueTranslations.request(),
      success: itwFetchCatalogueTranslations.success({})
    }
  ])(
    "hides cached introduction content while $name are loading",
    ({ request, success }) => {
      spyUseSelector.mockImplementation(selector =>
        selector === selectCredentialType ? ("mDL" as any) : false
      );
      const store = createStore(
        appReducer,
        appReducer(undefined, applicationChangeState("active")) as any
      );
      store.dispatch(itwFetchCredentialsCatalogue.success(catalogue));
      store.dispatch(request);
      const { getByText, queryByText } = renderComponent(
        { credentialType: "mDL" },
        store
      );
      expect(getByText(I18n.t("global.genericWaiting"))).toBeTruthy();
      expect(queryByText("Credential introduction")).toBeNull();
      expect(queryByText(I18n.t("global.buttons.continue"))).toBeNull();

      act(() => {
        store.dispatch(success);
      });
      expect(queryByText(I18n.t("global.genericWaiting"))).toBeNull();
      expect(getByText(I18n.t("global.buttons.continue"))).toBeTruthy();
    }
  );

  it("shows a spinner while skipping an introduction absent from the catalogue", () => {
    spyUseSelector.mockReturnValue("mDL" as any);
    const { getByText, queryByText } = renderComponent({
      credentialType: "mDL"
    });
    expect(getByText(I18n.t("global.genericWaiting"))).toBeTruthy();
    expect(queryByText(I18n.t("global.buttons.continue"))).toBeNull();
  });

  it("notifies the machine when leaving the introduction screen", () => {
    const { unmount } = renderComponent({ credentialType: "mDL" });
    mockSend.mockClear();
    unmount();
    expect(mockSend).toHaveBeenCalledWith({ type: "back" });
  });

  describe("dismissal dialog", () => {
    it("asks for confirmation on back when the flow comes from the wallet activation", () => {
      spyEidUseSelector.mockReturnValue("mDL" as any);

      const { getAllByLabelText } = renderComponent();

      getAllByLabelText(I18n.t("global.buttons.back")).forEach(fireEvent.press);

      expect(spyAlert).toHaveBeenCalledWith(
        I18n.t("features.itWallet.generic.alert.title"),
        I18n.t(
          "features.itWallet.issuance.credentialIntroduction.dismissalDialog.body"
        ),
        expect.any(Array)
      );
    });

    it("goes straight to the wallet on confirmation, without navigating back to the loading bridge screen", () => {
      spyEidUseSelector.mockReturnValue("mDL" as any);

      const { getAllByLabelText } = renderComponent();

      getAllByLabelText(I18n.t("global.buttons.back")).forEach(fireEvent.press);

      const [, confirmButton] = spyAlert.mock.calls[0][2] as Array<AlertButton>;
      act(() => {
        confirmButton.onPress?.();
      });

      expect(mockEidSend).toHaveBeenCalledWith({ type: "go-to-wallet" });
    });

    it("does not ask for confirmation on back when adding a credential to an active wallet", () => {
      const { getAllByLabelText } = renderComponent();

      getAllByLabelText(I18n.t("global.buttons.back")).forEach(fireEvent.press);

      expect(spyAlert).not.toHaveBeenCalled();
    });
  });
});
