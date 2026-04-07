import _ from "lodash";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as AAR_SELECTORS from "../../store/selectors";
import { AARFlowStateName, sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStates } from "../../utils/testUtils";
import {
  SendAARCieCardReadingScreen,
  SendAARCieCardReadingScreenProps
} from "../SendAARCieCardReadingScreen";

const mockReplace = jest.fn();
const mockShouldNeverCall = jest.fn();

jest.mock("../../components/SendAARCieCardReadingComponent");

describe("SendAARCieCardReadingScreen", () => {
  afterEach(jest.clearAllMocks);

  it.each(sendAarMockStates)(
    'should match the snapshot for the flowType = "$type"',
    aarState => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      const component = renderComponent();

      expect(component.toJSON()).toMatchSnapshot();
    }
  );

  sendAarMockStates.forEach(aarState => {
    const { type } = aarState;
    const shouldNavigate = (
      [
        sendAARFlowStates.ko,
        sendAARFlowStates.displayingNotificationData,
        sendAARFlowStates.cieCanAdvisory,
        sendAARFlowStates.cieScanningAdvisory
      ] as Array<AARFlowStateName>
    ).includes(type);
    const shouldNavigateBack = (
      [
        sendAARFlowStates.cieCanAdvisory,
        sendAARFlowStates.cieScanningAdvisory
      ] as Array<AARFlowStateName>
    ).includes(type);

    it(`${shouldNavigate ? "should" : "should not"} call "replace"${
      shouldNavigateBack ? ' with "pop" as animation parameter' : ""
    } and never call any non-replace actions when type is: "${type}"`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      renderComponent();

      if (shouldNavigate) {
        expect(mockReplace).toHaveBeenCalledTimes(1);
        if (shouldNavigateBack) {
          const replaceParams = mockReplace.mock.calls[0][1] as Record<
            string,
            unknown
          >;
          const hasAnimationTypeForReplace =
            "animationTypeForReplace" in replaceParams;
          expect(hasAnimationTypeForReplace).toBe(true);
          const animationTypeForReplace = replaceParams.animationTypeForReplace;
          expect(animationTypeForReplace).toBe("pop");
        }
      } else {
        expect(mockReplace).not.toHaveBeenCalled();
      }
      expect(mockShouldNeverCall).not.toHaveBeenCalled();
    });
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ route, navigation }: SendAARCieCardReadingScreenProps) => (
      <SendAARCieCardReadingScreen
        navigation={{
          ..._.mapValues(navigation, () => mockShouldNeverCall),
          replace: mockReplace
        }}
        route={{
          ...route,
          params: {
            can: "123456",
            iun: "iun",
            mandateId: "mandate_id",
            verificationCode: "verification_code",
            recipientInfo: { denomination: "", taxId: "AAAAAA00A00A000A" }
          }
        }}
      />
    ),
    PN_ROUTES.SEND_AAR_CIE_CARD_READING,
    {},
    store
  );
}
