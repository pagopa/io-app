import { render } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { ItwEidLifecycleAlert } from "../ItwEidLifecycleAlert";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ItwStoredCredentialsMocks } from "../../utils/itwMocksUtils";
import * as alertTracking from "../../hooks/useItwEidLifecycleAlertTracking";

const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn(() => jest.fn())
} as any;

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => mockNavigation
}));

describe("ItwEidLifecycleAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not crash when rendered outside a navigation context without currentScreenName", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(O.some(ItwStoredCredentialsMocks.eid));
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("jwtExpiring");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    expect(() =>
      render(
        <Provider store={store}>
          <ItwEidLifecycleAlert navigation={mockNavigation} />
        </Provider>
      )
    ).not.toThrow();
  });

  it("should forward currentScreenName to the tracking hook", () => {
    const expectedRoute = "ITW_PRESENTATION_EID_DETAIL";
    const trackingSpy = jest.spyOn(
      alertTracking,
      "useItwEidLifecycleAlertTracking"
    );

    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(O.some(ItwStoredCredentialsMocks.eid));
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("jwtExpiring");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    renderComponent({ currentScreenName: expectedRoute });

    expect(trackingSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        currentScreenName: expectedRoute
      })
    );
  });

  it("should render the alert when eID status is included in lifecycleStatus", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(O.some(ItwStoredCredentialsMocks.eid));
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("jwtExpiring");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwEidLifecycleAlertTestID")).not.toBeNull();
  });

  it("should not render the alert when eID option is none", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(O.none);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue(undefined);
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwEidLifecycleAlertTestID")).toBeNull();
  });

  it("should not render the alert when eID status is not in lifecycleStatus", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(O.some(ItwStoredCredentialsMocks.eid));
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("valid");
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent({
      lifecycleStatus: ["jwtExpiring"]
    });

    expect(queryByTestId("itwEidLifecycleAlertTestID")).toBeNull();
  });
});

const renderComponent = (
  props: Partial<React.ComponentProps<typeof ItwEidLifecycleAlert>> = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return render(
    <Provider store={store}>
      <ItwEidLifecycleAlert navigation={mockNavigation} {...props} />
    </Provider>
  );
};
