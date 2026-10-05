import { createStackNavigator } from "@react-navigation/stack";
import { Text } from "react-native";
import configureMockStore from "redux-mock-store";

import type { ItwJwtCredentialStatus } from "../../../common/utils/itwTypesUtils";

import { applicationChangeState } from "../../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { appReducer } from "../../../../../store/reducers";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as itwCommonSelectors from "../../../common/store/selectors";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidReissuanceLandingScreen } from "../ItwIssuanceEidReissuanceLandingScreen";

const Stack = createStackNavigator();
const targetTestId = "eid-issuance-target";

describe("ItwIssuanceEidReissuanceLandingScreen", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it.each`
    isAnyWalletValid | isItWalletValid | canActivateItWallet | eidStatus
    ${true}          | ${false}        | ${true}             | ${"jwtExpiring"}
    ${true}          | ${false}        | ${true}             | ${"valid"}
    ${true}          | ${true}         | ${true}             | ${"jwtExpiring"}
    ${true}          | ${true}         | ${true}             | ${"valid"}
    ${false}         | ${false}        | ${true}             | ${undefined}
    ${false}         | ${false}        | ${false}            | ${undefined}
  `(
    "match snapshot for isAnyWalletValid=$isAnyWalletValid, isItWalletValid=$isItWalletValid, canActivateItWallet=$canActivateItWallet, eidStatus=$eidStatus",
    ({ isAnyWalletValid, isItWalletValid, canActivateItWallet, eidStatus }) => {
      mockSelectors({
        isAnyWalletValid,
        isItWalletValid,
        canActivateItWallet,
        eidStatus
      });

      const componentNoParams = renderComponent();
      expect(componentNoParams).toMatchSnapshot();
    }
  );

  describe("startup gating", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("waits for authenticated startup before navigating", () => {
      mockSelectors({
        isAnyWalletValid: true,
        isItWalletValid: true,
        canActivateItWallet: false,
        eidStatus: "jwtExpiring"
      });

      const { queryByTestId } = renderComponentWithTarget(
        StartupStatusEnum.INITIAL
      );

      expect(queryByTestId(targetTestId)).toBeNull();
    });

    it("navigates after authenticated startup", () => {
      mockSelectors({
        isAnyWalletValid: true,
        isItWalletValid: true,
        canActivateItWallet: false,
        eidStatus: "jwtExpiring"
      });

      const { getByTestId } = renderComponentWithTarget(
        StartupStatusEnum.AUTHENTICATED
      );

      expect(getByTestId(targetTestId)).toBeTruthy();
    });
  });
});

type MockSelectorOptions = {
  canActivateItWallet?: boolean;
  eidStatus?: ItwJwtCredentialStatus;
  isAnyWalletValid?: boolean;
  isItWalletValid?: boolean;
};

const mockSelectors = ({
  canActivateItWallet = false,
  eidStatus,
  isAnyWalletValid = false,
  isItWalletValid = false
}: MockSelectorOptions = {}) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
    .mockReturnValue(isAnyWalletValid);
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(isItWalletValid);
  jest
    .spyOn(itwCommonSelectors, "itwIsL3EnabledSelector")
    .mockReturnValue(canActivateItWallet);
  jest
    .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
    .mockReturnValue(eidStatus);
};

const renderComponent = (startupStatus?: StartupStatusEnum) => {
  const stateAfterApplicationChange = appReducer(
    undefined,
    applicationChangeState("active")
  );
  const globalState =
    startupStatus === undefined
      ? stateAfterApplicationChange
      : appReducer(
          stateAfterApplicationChange,
          startupLoadSuccess(startupStatus)
        );

  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceEidReissuanceLandingScreen,
    ITW_ROUTES.LANDING.EID_REISSUANCE,
    {},
    store
  );
};

const renderComponentWithTarget = (startupStatus: StartupStatusEnum) => {
  const stateAfterApplicationChange = appReducer(
    undefined,
    applicationChangeState("active")
  );
  const globalState = appReducer(
    stateAfterApplicationChange,
    startupLoadSuccess(startupStatus)
  );
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <Stack.Navigator>
        <Stack.Screen
          component={ItwIssuanceEidReissuanceLandingScreen}
          name={ITW_ROUTES.LANDING.EID_REISSUANCE}
        />
        <Stack.Screen name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION}>
          {() => <Text testID={targetTestId} />}
        </Stack.Screen>
      </Stack.Navigator>
    ),
    "EID_TEST_NAVIGATOR",
    {},
    store
  );
};
