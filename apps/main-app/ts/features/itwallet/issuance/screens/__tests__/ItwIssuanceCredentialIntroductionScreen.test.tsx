import { act, fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Alert, AlertButton } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
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
    spyUseActorRef.mockReturnValue({ send: mockSend } as any);
    spyEidUseActorRef.mockReturnValue({ send: mockEidSend } as any);
    // No credential type resolved yet in the machine context: renders the
    // generic error fallback, which is irrelevant to what these tests assert
    // (whether "select-credential" was sent on mount).
    spyUseSelector.mockReturnValue(O.none as any);
    // By default the eID machine was not started by a credential request
    spyEidUseSelector.mockReturnValue(undefined as any);
  });

  const renderComponent = (params?: {
    credentialType?: string;
    mode?: string;
  }) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    return renderScreenWithNavigationStoreContext<GlobalState>(
      ItwIssuanceCredentialIntroductionScreen,
      ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION,
      params ?? {},
      store
    );
  };

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
