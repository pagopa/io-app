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
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidReissuanceLandingScreen } from "../ItwIssuanceEidReissuanceLandingScreen";

const Stack = createStackNavigator();
const targetTestId = "eid-issuance-target";
const mockTargetParams = jest.fn();

describe("ItwIssuanceEidReissuanceLandingScreen", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it.each(
    (
      [
        {
          lifecycle: lifecycleSelectors.ItwLifecycleState.DOC_IO_UPGRADABLE,
          eidStatus: "jwtExpiring"
        },
        {
          lifecycle: lifecycleSelectors.ItwLifecycleState.DOC_IO_UPGRADABLE,
          eidStatus: "valid"
        },
        {
          lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET,
          eidStatus: "jwtExpiring"
        },
        {
          lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET,
          eidStatus: "valid"
        },
        {
          lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET_ELIGIBLE,
          eidStatus: undefined
        },
        {
          lifecycle: lifecycleSelectors.ItwLifecycleState.INACTIVE,
          eidStatus: undefined
        }
      ] satisfies Array<MockSelectorOptions>
    ).map(row => ({
      ...row,
      lifecycleName: lifecycleSelectors.ItwLifecycleState[row.lifecycle]
    }))
  )(
    "match snapshot for lifecycle=$lifecycleName, eidStatus=$eidStatus",
    options => {
      mockSelectors(options);

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
        lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET,
        eidStatus: "jwtExpiring"
      });

      const { queryByTestId } = renderComponentWithTarget(
        StartupStatusEnum.INITIAL
      );

      expect(queryByTestId(targetTestId)).toBeNull();
    });

    it("navigates after authenticated startup", () => {
      mockSelectors({
        lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET,
        eidStatus: "jwtExpiring"
      });

      const { getByTestId } = renderComponentWithTarget(
        StartupStatusEnum.AUTHENTICATED
      );

      expect(getByTestId(targetTestId)).toBeTruthy();
    });
  });

  describe("eID reissuance", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // Regression: IT-Wallet users used to reissue the eID with the default "l2"
    test.each(
      (
        [
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET,
            eidStatus: "jwtExpiring",
            level: "l3"
          },
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.IT_WALLET,
            eidStatus: "jwtExpired",
            level: "l3"
          },
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.DOC_IO,
            eidStatus: "jwtExpiring",
            level: "l2"
          },
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.DOC_IO,
            eidStatus: "jwtExpired",
            level: "l2"
          }
        ] satisfies Array<MockSelectorOptions & { level: "l2" | "l3" }>
      ).map(row => ({
        ...row,
        lifecycleName: lifecycleSelectors.ItwLifecycleState[row.lifecycle]
      }))
    )(
      "navigates to identification with level $level when the lifecycle is $lifecycleName and the eID is $eidStatus",
      ({ level, ...options }) => {
        mockSelectors(options);

        renderComponentWithTarget(StartupStatusEnum.AUTHENTICATED);

        expect(mockTargetParams).toHaveBeenCalledWith({
          eidReissuing: true,
          level,
          animationEnabled: false
        });
      }
    );
  });
});

type MockSelectorOptions = {
  eidStatus?: ItwJwtCredentialStatus;
  lifecycle: lifecycleSelectors.ItwLifecycleState;
};

const mockSelectors = ({ eidStatus, lifecycle }: MockSelectorOptions) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleStateSelector")
    .mockReturnValue(lifecycle);
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
          {({ route }) => {
            mockTargetParams(route.params);
            return <Text testID={targetTestId} />;
          }}
        </Stack.Screen>
      </Stack.Navigator>
    ),
    "EID_TEST_NAVIGATOR",
    {},
    store
  );
};
