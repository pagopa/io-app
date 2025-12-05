import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { SendAARCieCardReadingScreen } from "../SendAARCieCardReadingScreen";
import { sendAARFlowStates } from "../../utils/stateUtils";
import * as AAR_SELECTORS from "../../store/selectors";

jest.mock("../../components/SendAARCieCardReadingComponent");

describe("SendAARCieCardReadingScreen", () => {
  it.each(Object.values(sendAARFlowStates))(
    'should match the snapshot for the flowType = "%s"',
    flowType => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowStateType")
        .mockReturnValue(flowType);
      const component = renderComponent();

      expect(component.toJSON()).toMatchSnapshot();
    }
  );
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ route, navigation }) => (
      <SendAARCieCardReadingScreen
        navigation={navigation}
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
