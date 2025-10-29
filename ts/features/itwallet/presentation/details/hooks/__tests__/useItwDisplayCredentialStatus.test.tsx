import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import { useItwDisplayCredentialStatus } from "../useItwDisplayCredentialStatus";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../../common/utils/itwTypesUtils";
import * as itwCredentialsSelectors from "../../../../credentials/store/selectors";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import { OfflineAccessReasonEnum } from "../../../../../ingress/store/reducer";

const mockStore = configureMockStore<GlobalState>();

const renderHook = (
  credentialStatus: ItwCredentialStatus,
  eidStatus: ItwJwtCredentialStatus | undefined,
  isOffline: boolean
) => {
  jest
    .spyOn(ingressSelectors, "offlineAccessReasonSelector")
    .mockReturnValue(
      isOffline ? OfflineAccessReasonEnum.DEVICE_OFFLINE : undefined
    );

  jest
    .spyOn(itwCredentialsSelectors, "itwCredentialsEidStatusSelector")
    .mockReturnValue(eidStatus);

  const store = mockStore(
    appReducer(undefined, applicationChangeState("active"))
  );

  function TestComponent() {
    const status = useItwDisplayCredentialStatus(credentialStatus);
    return <Text testID="hook-result">{status}</Text>;
  }

  const { getByTestId } = render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );

  return getByTestId("hook-result").props.children as ItwCredentialStatus;
};

describe("useItwDisplayCredentialStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  type Scenario = {
    credentialStatus: ItwCredentialStatus;
    eidStatus: ItwJwtCredentialStatus;
    isOffline: boolean;
    expected: ItwCredentialStatus;
  };

  const scenarios: ReadonlyArray<Scenario> = [
    {
      credentialStatus: "valid",
      eidStatus: "jwtExpiring",
      isOffline: true,
      expected: "valid"
    },
    {
      credentialStatus: "jwtExpiring",
      eidStatus: "valid",
      isOffline: true,
      expected: "valid"
    },
    {
      credentialStatus: "jwtExpired",
      eidStatus: "valid",
      isOffline: true,
      expected: "jwtExpired"
    },
    {
      credentialStatus: "expired",
      eidStatus: "valid",
      isOffline: true,
      expected: "expired"
    },
    {
      credentialStatus: "jwtExpired",
      eidStatus: "jwtExpired",
      isOffline: true,
      expected: "valid"
    },
    {
      credentialStatus: "jwtExpiring",
      eidStatus: "jwtExpiring",
      isOffline: false,
      expected: "valid"
    },
    {
      credentialStatus: "valid",
      eidStatus: "jwtExpired",
      isOffline: false,
      expected: "valid"
    },
    {
      credentialStatus: "jwtExpired",
      eidStatus: "jwtExpired",
      isOffline: false,
      expected: "valid"
    },
    {
      credentialStatus: "expiring",
      eidStatus: "jwtExpired",
      isOffline: false,
      expected: "expiring"
    },
    {
      credentialStatus: "expired",
      eidStatus: "jwtExpired",
      isOffline: false,
      expected: "expired"
    },
    {
      credentialStatus: "jwtExpiring",
      eidStatus: "valid",
      isOffline: false,
      expected: "jwtExpiring"
    },
    {
      credentialStatus: "jwtExpired",
      eidStatus: "valid",
      isOffline: false,
      expected: "jwtExpired"
    }
  ];

  test.each(scenarios)(
    "$credentialStatus / $eidStatus / offline=$isOffline → $expected",
    ({ credentialStatus, eidStatus, isOffline, expected }) => {
      const result = renderHook(credentialStatus, eidStatus, isOffline);
      expect(result).toBe(expected);
    }
  );
});
