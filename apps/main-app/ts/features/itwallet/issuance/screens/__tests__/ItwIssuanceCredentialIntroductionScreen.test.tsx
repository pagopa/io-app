import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
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

  const mockSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    spyUseActorRef.mockReturnValue({ send: mockSend } as any);
    // No credential type resolved yet in the machine context: renders the
    // generic error fallback, which is irrelevant to what these tests assert
    // (whether "select-credential" was sent on mount).
    spyUseSelector.mockReturnValue(O.none as any);
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
});
