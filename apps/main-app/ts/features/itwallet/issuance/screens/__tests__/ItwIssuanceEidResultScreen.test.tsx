import { render, waitFor } from "@testing-library/react-native";
import { useRoute } from "@react-navigation/native";
import { useIOSelector } from "../../../../../store/hooks";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  selectCredentialType,
  selectIsLoading,
  selectIssuanceMode,
  selectUpgradeFailedCredentials
} from "../../../machine/eid/selectors";
import { ItwIssuanceEidResultScreen } from "../ItwIssuanceEidResultScreen";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn()
}));

jest.mock("../../../../../components/screens/LoadingScreenContent", () => ({
  __esModule: true,
  default: () => null
}));

jest.mock("../../../common/hooks/useItwDisableGestureNavigation", () => ({
  useItwDisableGestureNavigation: jest.fn()
}));

describe("ItwIssuanceEidResultScreen", () => {
  const eidMachineSend = jest.fn();
  const credentialMachineSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRoute as jest.Mock).mockReturnValue({
      name: "ITW_ISSUANCE_EID_RESULT"
    });
    (useIOSelector as jest.Mock).mockReturnValue(true);
    jest
      .spyOn(ItwEidIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: eidMachineSend } as any);
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: credentialMachineSend } as any);
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useSelector")
      .mockReturnValue(true as any);
    jest
      .spyOn(ItwEidIssuanceMachineContext, "useSelector")
      .mockImplementation(selector => {
        switch (selector) {
          case selectCredentialType:
            return "education_degree" as any;
          case selectIsLoading:
            return false as any;
          case selectIssuanceMode:
            return "issuance" as any;
          case selectUpgradeFailedCredentials:
            return [] as any;
          default:
            return undefined as any;
        }
      });
  });

  it("resumes the resolved credential offer after eID issuance completes", async () => {
    render(<ItwIssuanceEidResultScreen />);

    await waitFor(() =>
      expect(credentialMachineSend).toHaveBeenCalledWith({
        type: "confirm-credential-offer"
      })
    );
    expect(credentialMachineSend).not.toHaveBeenCalledWith({
      type: "select-credential",
      mode: "issuance",
      credentialType: "education_degree"
    });
  });
});
