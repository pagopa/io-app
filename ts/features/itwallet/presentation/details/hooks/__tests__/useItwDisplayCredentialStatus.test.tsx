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

  it.each`
    credentialStatus | eidStatus        | isOffline | expected
    ${"valid"}       | ${"jwtExpiring"} | ${true}   | ${"valid"}
    ${"jwtExpiring"} | ${"valid"}       | ${true}   | ${"valid"}
    ${"jwtExpired"}  | ${"valid"}       | ${true}   | ${"jwtExpired"}
    ${"expired"}     | ${"valid"}       | ${true}   | ${"expired"}
    ${"jwtExpired"}  | ${"jwtExpired"}  | ${true}   | ${"valid"}
    ${"jwtExpiring"} | ${"jwtExpiring"} | ${false}  | ${"valid"}
    ${"valid"}       | ${"jwtExpired"}  | ${false}  | ${"valid"}
    ${"jwtExpired"}  | ${"jwtExpired"}  | ${false}  | ${"valid"}
    ${"expiring"}    | ${"jwtExpired"}  | ${false}  | ${"expiring"}
    ${"expired"}     | ${"jwtExpired"}  | ${false}  | ${"expired"}
    ${"jwtExpiring"} | ${"valid"}       | ${false}  | ${"jwtExpiring"}
    ${"jwtExpired"}  | ${"valid"}       | ${false}  | ${"jwtExpired"}
  `(
    "should return '$expected' for credentialStatus=$credentialStatus, eidStatus=$eidStatus, offline=$isOffline",
    ({ credentialStatus, eidStatus, isOffline, expected }) => {
      const result = renderHook(credentialStatus, eidStatus, isOffline);
      expect(result).toBe(expected);
    }
  );
});
