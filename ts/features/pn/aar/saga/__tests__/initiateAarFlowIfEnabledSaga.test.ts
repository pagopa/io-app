import { StackActions } from "@react-navigation/native";
import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../../navigation/NavigationService";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
import { initiateAarFlowIfEnabled } from "../InitiateAarFlowIfEnabledSaga";
import { terminateAarFlow, tryInitiateAarFlow } from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { isAarRemoteEnabled } from "../../../../../store/reducers/backendStatus/remoteConfig";
import {
  currentAARFlowStateType,
  currentAarFlowIunSelector
} from "../../store/selectors";

jest.mock("../../../../../navigation/NavigationService");

describe("initiateAarFlowIfEnabled saga", () => {
  const aarUrl = "https://example.com/aar";
  const action = tryInitiateAarFlow({ aarUrl });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return early if AAR is not enabled", () => {
    testSaga(initiateAarFlowIfEnabled, action)
      .next()
      .select(isAarRemoteEnabled)
      .next(false)
      .isDone();

    expect(NavigationService.dispatchNavigationAction).not.toHaveBeenCalled();
    expect(NavigationService.navigate).not.toHaveBeenCalled();
  });

  it("should terminate current flow and replace navigation if flow state is not none", () => {
    const mockNavigate =
      NavigationService.dispatchNavigationAction as jest.Mock;
    const mockCurrentState = sendAARFlowStates.fetchingQRData;

    testSaga(initiateAarFlowIfEnabled, action)
      .next()
      .select(isAarRemoteEnabled)
      .next(true)
      .select(currentAARFlowStateType)
      .next(mockCurrentState)
      .select(currentAarFlowIunSelector)
      .next("iun-123")
      .put(terminateAarFlow({ messageId: "iun-123" }))
      .next()
      .call(
        mockNavigate,
        StackActions.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.QR_SCAN_FLOW,
            params: { aarUrl }
          }
        })
      )
      .next()
      .isDone();
  });

  it("should navigate to QR_SCAN_FLOW if flow state is none", () => {
    const mockNavigate = NavigationService.navigate as jest.Mock;

    testSaga(initiateAarFlowIfEnabled, action)
      .next()
      .select(isAarRemoteEnabled)
      .next(true)
      .select(currentAARFlowStateType)
      .next(sendAARFlowStates.none)
      .call(mockNavigate, MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.QR_SCAN_FLOW,
          params: { aarUrl }
        }
      })
      .next()
      .isDone();
  });
});
