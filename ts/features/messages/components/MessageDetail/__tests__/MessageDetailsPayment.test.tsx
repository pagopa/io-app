import * as React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { PaymentData, UIMessageDetails, UIMessageId } from "../../../types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsPayment } from "../MessageDetailsPayment";
import { loadMessageDetails } from "../../../store/actions";

describe("MessageDetailsPayment", () => {
  it("Should match snapshot for no payment data", () => {
    const messageId = "01HRA9THAS0NHCXS20A0FAW5Y2" as UIMessageId;
    const component = renderScreen(messageId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot when there are payment data", () => {
    const messageId = "01HRA9TP2GMNHGMF2GK8V4PYSF" as UIMessageId;
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

const renderScreen = (messageId: UIMessageId, paymentData?: PaymentData) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const finalState = appReducer(
    designSystemState,
    loadMessageDetails.success({
      id: messageId,
      paymentData
    } as UIMessageDetails)
  );
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessageDetailsPayment messageId={messageId} />,
    "DUMMY",
    {},
    store
  );
};
