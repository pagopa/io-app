import { createStore } from "redux";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import PN_ROUTES from "../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessagePaymentBottomSheet } from "../MessagePaymentBottomSheet";
import { UIMessageId } from "../../../messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import { remoteError, remoteReady } from "../../../../common/model/RemoteValue";
import { Detail_v2Enum } from "../../../../../definitions/payments/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

describe("MessagePaymentBottomSheet", () => {
  it("should match snapshot, no payments", () => {
    const messageId = "01HTHS3N21AFMBMKHGWVRAMXQ6" as UIMessageId;
    const component = renderComponent(messageId, [], globalState());
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, six payments", () => {
    const messageId = "01HTHS3N21AFMBMKHGWVRAMXQ6" as UIMessageId;
    const initialState = globalState();
    const paymentIdList = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            [messageId]: {
              [paymentIdList[0]]: remoteReady({
                codiceContestoPagamento: paymentIdList[0],
                importoSingoloVersamento: 199,
                dueDate: new Date(2024, 0, 1, 1, 3),
                causaleVersamento: "Uno due tre"
              }),
              [paymentIdList[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIdList[2]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_SCADUTO
              ),
              [paymentIdList[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIdList[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              ),
              [paymentIdList[5]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO
              ),
              [paymentIdList[6]]: remoteError(Detail_v2Enum.GENERIC_ERROR)
            }
          }
        }
      }
    };
    const paymentList = paymentIdList.map(
      paymentID =>
        ({
          creditorTaxId: paymentID.substring(0, 11),
          noticeCode: paymentID.substring(11)
        } as NotificationPaymentInfo)
    );
    const component = renderComponent(messageId, paymentList, paymentsState);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const globalState = () =>
  appReducer(undefined, applicationChangeState("active"));

const renderComponent = (
  messageId: UIMessageId,
  payments: ReadonlyArray<NotificationPaymentInfo>,
  state: GlobalState
) => {
  const store = createStore(appReducer, state as any);
  const mockPresentPaymentsBottomSheetRef = {
    current: () => undefined
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessagePaymentBottomSheet
        messageId={messageId}
        payments={payments}
        presentPaymentsBottomSheetRef={mockPresentPaymentsBottomSheetRef}
        serviceId={"01J5X3CYV736B41KSZS8DYR75Q" as ServiceId}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
