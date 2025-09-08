import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { PaymentData, UIMessageDetails } from "../../../types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsPayment } from "../MessageDetailsPayment";
import { loadMessageDetails } from "../../../store/actions";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

describe("MessageDetailsPayment", () => {
  it("Should match snapshot for no payment data", () => {
    const messageId = "01HRA9THAS0NHCXS20A0FAW5Y2";
    const component = renderScreen(messageId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot when there are payment data", () => {
    const messageId = "01HRA9TP2GMNHGMF2GK8V4PYSF";
    const component = renderScreen(messageId, {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      },
      amount: 199
    } as PaymentData);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (messageId: string, paymentData?: PaymentData) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState = appReducer(
    initialState,
    loadMessageDetails.success({
      id: messageId,
      paymentData
    } as UIMessageDetails)
  );
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsPayment
        messageId={messageId}
        serviceId={"01J5X3BYKRC2AYVANSCZQM1CPS" as ServiceId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
