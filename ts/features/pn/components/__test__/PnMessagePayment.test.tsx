import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { RenderAPI, render } from "@testing-library/react-native";
import { PnMessagePayment } from "../PnMessagePayment";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { NotificationPaymentInfo } from "../../store/types/types";
import { SafeAreaProvider } from "react-native-safe-area-context";

describe("PnMessagePayment component", () => {
  // Renders nothing
  it("should render nothing when the PN message is not cancelled and there is no payment data nor completed payment", () => {
    const pnMessagePaymentComponent = renderComponent();
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeFalsy();
  });
  it("should render nothing when the PN message is not cancelled and there is no payment data but there is a completed payment", () => {
    const noticeCode = generateNoticeCode();
    const pnMessagePaymentComponent = renderComponent(
      undefined,
      false,
      noticeCode
    );
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeFalsy();
  });
  it("should render nothing when the PN message is cancelled and there is a no payment data nor completed playment", () => {
    const pnMessagePaymentComponent = renderComponent(undefined, true);
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeFalsy();
  });
  // Renders normal payment on not cancelled notification
  it("should render the normal payment when the PN message is not cancelled and there is a payment with no completed payment", () => {
    const pnPayment = generatePnPayment();
    const pnMessagePaymentComponent = renderComponent(pnPayment);
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeFalsy();
  });
  it("should render the normal payment when the PN message is not cancelled and there is a payment and a completed payment (data misconfiguration - there should not be a completed payment data in a not cancelled PN message)", () => {
    const pnPayment = generatePnPayment();
    const noticeCode = generateNoticeCode();
    const pnMessagePaymentComponent = renderComponent(
      pnPayment,
      false,
      noticeCode
    );
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeFalsy();
  });
  // Renders completed payment on cancelled notification
  it("should render the completed payment section title and Info Box when the PN message is cancelled and there is a payment but not a completed payment", () => {
    const pnPayment = generatePnPayment();
    const pnMessagePaymentComponent = renderComponent(pnPayment, true);
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeFalsy();
  });
  it("should render the completed payment section title, Info Box and Payment cell when the PN message is cancelled and there is a payment and a completed payment", () => {
    const noticeCode = generateNoticeCode();
    const pnMessagePaymentComponent = renderComponent(
      undefined,
      true,
      noticeCode
    );
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeDefined();
  });
  it("should render the completed payment section title, Info Box and Payment cell when the PN message is cancelled and there is no payment but a completed payment", () => {
    const pnPayment = generatePnPayment();
    const noticeCode = generateNoticeCode();
    const pnMessagePaymentComponent = renderComponent(
      pnPayment,
      true,
      noticeCode
    );
    const pnPaymentSections = queryPnPaymentSections(pnMessagePaymentComponent);
    expect(pnPaymentSections.paymentSectionTitle).toBeFalsy();
    expect(pnPaymentSections.cancelledPaymentSectionTitle).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentInfoBox).toBeDefined();
    expect(pnPaymentSections.cancelledPaymentModulePaymentNotice).toBeDefined();
  });
});

const generateNoticeCode = () => "090000669905675782";

const generatePnPayment = () =>
  ({
    noticeCode: generateNoticeCode(),
    creditorTaxId: "00000000009"
  } as NotificationPaymentInfo);

const queryPnPaymentSections = (component: RenderAPI) => ({
  paymentSectionTitle: component.queryByTestId("PnPaymentSectionTitle"),
  cancelledPaymentSectionTitle: component.queryByTestId(
    "PnCancelledPaymentSectionTitle"
  ),
  cancelledPaymentInfoBox: component.queryByTestId("PnCancelledPaymentInfoBox"),
  cancelledPaymentModulePaymentNotice: component.queryByTestId(
    "PnCancelledPaymentModulePaymentNotice"
  )
});

const renderComponent = (
  payment: NotificationPaymentInfo | undefined = undefined,
  isCancelled: boolean = false,
  completedPaymentNoticeCode: string | undefined = undefined
) =>
  render(
    <SafeAreaProvider>
      <PnMessagePayment
        messageId={"00000000000000000000000003" as UIMessageId}
        firstLoadingRequest={true}
        isCancelled={isCancelled}
        isPaid={false}
        payment={payment}
        paymentVerification={pot.none}
        paymentVerificationError={O.none}
        completedPaymentNoticeCode={completedPaymentNoticeCode}
      />
    </SafeAreaProvider>
  );
