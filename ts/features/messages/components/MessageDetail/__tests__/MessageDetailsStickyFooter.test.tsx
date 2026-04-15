import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsStickyFooter } from "../MessageDetailsStickyFooter";
import { PaymentData } from "../../../types";
import { CTA, CTAS } from "../../../../../types/LocalizedCTAs";
import * as detailsById from "../../../store/reducers/detailsById";
import * as payments from "../../../store/reducers/payments";
import { PaymentAmount } from "../../../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../../../definitions/backend/PaymentNoticeNumber";
import { OrganizationFiscalCode } from "../../../../../../definitions/backend/OrganizationFiscalCode";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

const cta1: CTA = {
  text: "CTA 1",
  action: ""
};
const cta2: CTA = {
  text: "CTA 2",
  action: ""
};
const bothCTAs: CTAS = {
  cta_1: cta1,
  cta_2: cta2
};
const onlyCTA1: CTAS = {
  cta_1: cta1
};
const paymentData: PaymentData = {
  amount: 199 as PaymentAmount,
  noticeNumber: "012345678912345610" as PaymentNoticeNumber,
  payee: {
    fiscalCode: "01234567890" as OrganizationFiscalCode
  }
};

describe("MessageDetailsStickyFooter", () => {
  it("should match snapshot with both CTAs and visible payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => paymentData);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "enabled");
    const component = renderComponent(bothCTAs);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with one CTA and visible payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => paymentData);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "enabled");
    const component = renderComponent(onlyCTA1);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with no CTAs and enabled payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => paymentData);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "enabled");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with no CTAs and loading payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => paymentData);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "loading");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with no CTAs and hidden payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => paymentData);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "hidden");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with both CTAs and no payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => undefined);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "hidden");
    const component = renderComponent(bothCTAs);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with one CTA and no payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => undefined);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "hidden");
    const component = renderComponent(onlyCTA1);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with no CTA and no payment button", () => {
    jest
      .spyOn(detailsById, "messagePaymentDataSelector")
      .mockImplementation((_state, _messageId) => undefined);
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockImplementation((_state, _messageId) => "hidden");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (ctas?: CTAS) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsStickyFooter
        messageId={"01HRW6GJBD594Z0K9B4D6KAERC"}
        ctas={ctas}
        firstCTAIsPNOptInMessage={false}
        secondCTAIsPNOptInMessage={false}
        serviceId={"01J5XCQMBNF0484AJV2TST03FE" as ServiceId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
