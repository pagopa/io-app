import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../../ingress/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import {
  ItwCredentialWalletCard,
  ItwCredentialWalletCardProps
} from "../ItwCredentialWalletCard";

const mockNavigation = jest.fn();

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigation
  })
}));

describe("WrappedItwCredentialCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should navigate to the credential details screen", () => {
    const tCredentialType = "mDL";

    const { getByTestId } = renderComponent({
      credentialType: tCredentialType
    });
    const button = getByTestId("ItwCredentialWalletCardTestID");
    fireEvent.press(button);

    expect(mockNavigation).toHaveBeenCalledWith("ITW_MAIN", {
      params: { credentialType: tCredentialType },
      screen: "ITW_PRESENTATION_CREDENTIAL_DETAIL"
    });
  });

  it("should navigate to the credential upgrade flow", () => {
    const tCredentialType = "mDL";

    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

    const { getByTestId } = renderComponent({
      credentialType: tCredentialType
    });
    const button = getByTestId("ItwCredentialWalletCardTestID");
    fireEvent.press(button);

    expect(mockNavigation).toHaveBeenCalledWith("ITW_MAIN", {
      params: { credentialType: tCredentialType, isUpgrade: true },
      screen: "ITW_ISSUANCE_CREDENTIAL_TRUST_ISSUER"
    });
  });

  it("should not navigate to the credential upgrade flow if device offline", () => {
    const tCredentialType = "mDL";

    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

    const { getByTestId } = renderComponent({
      credentialType: tCredentialType
    });
    const button = getByTestId("ItwCredentialWalletCardTestID");
    fireEvent.press(button);

    expect(mockNavigation).not.toHaveBeenCalled();
  });
});

const renderComponent = (props: ItwCredentialWalletCardProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <ItwCredentialWalletCard cardProps={props} />,
    "ANY_ROUTE",
    {},
    store
  );
};
