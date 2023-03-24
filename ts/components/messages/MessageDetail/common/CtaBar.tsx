import * as O from "fp-ts/lib/Option";
import React from "react";
import { View, StyleSheet } from "react-native";
import { CommonServiceMetadata } from "../../../../../definitions/backend/CommonServiceMetadata";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIODispatch } from "../../../../store/hooks";
import {
  getPaymentExpirationInfo,
  PaymentData,
  UIMessageDetails,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { UIService } from "../../../../store/reducers/entities/services/types";
import variables from "../../../../theme/variables";

import {
  getMessageCTA,
  isExpired,
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import { HSpacer } from "../../../core/spacer/Spacer";
import { IOStyles } from "../../../core/variables/IOStyles";
import ExtractedCTABar from "../../../cta/ExtractedCTABar";
import CalendarEventButton from "./CalendarEventButton";
import PaymentButton from "./PaymentButton";

type Props = {
  isPaid: boolean;
  messageDetails: UIMessageDetails;
  service?: UIService;
  serviceMetadata?: CommonServiceMetadata;
};

const styles = StyleSheet.create({
  footerContainer: {
    overflow: "hidden",
    marginTop: -variables.footerShadowOffsetHeight,
    paddingTop: variables.footerShadowOffsetHeight
  }
});

// return a payment button only when the advice is not paid and the payment_data is defined
const renderPaymentButton = (
  paymentData?: PaymentData,
  messageId?: UIMessageId
) => {
  if (paymentData === undefined) {
    return null;
  }
  const { amount, noticeNumber, payee } = paymentData;
  return (
    <PaymentButton
      amount={amount}
      noticeNumber={noticeNumber}
      organizationFiscalCode={payee.fiscalCode}
      messageId={messageId}
    />
  );
};

function renderCalendarEventButton(
  isPaid: boolean,
  expirationInfo: MessagePaymentExpirationInfo,
  legacyMessage: UIMessageDetails["raw"],
  dueDate?: Date
) {
  if (dueDate === undefined || isPaid || isExpired(expirationInfo)) {
    return null;
  }
  return <CalendarEventButton message={legacyMessage} />;
}

/**
 * A smart component to show the action buttons of a message.
 * It requires context and full redux support.
 *
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 */
const CtaBar = ({
  isPaid,
  messageDetails,
  service,
  serviceMetadata
}: Props): React.ReactElement | null => {
  const dispatch = useIODispatch();
  // in case of medical prescription, we shouldn't render the CtaBar
  if (messageDetails.prescriptionData !== undefined) {
    return null;
  }
  const expirationInfo = getPaymentExpirationInfo(messageDetails);
  const { dueDate, markdown, paymentData, raw: legacyMessage } = messageDetails;

  const paymentButton = renderPaymentButton(paymentData, messageDetails.id);
  const calendarButton = renderCalendarEventButton(
    isPaid,
    expirationInfo,
    legacyMessage,
    dueDate
  );

  const footer1 = (paymentButton || calendarButton) && (
    // Added a wrapper to enable the usage of the component outside the Container of Native Base
    <View style={styles.footerContainer} pointerEvents={"box-none"}>
      <View style={[IOStyles.footer, IOStyles.row]}>
        {calendarButton}
        {paymentButton && calendarButton && <HSpacer size={16} />}
        {paymentButton}
      </View>
    </View>
  );
  const maybeCtas = getMessageCTA(
    markdown,
    serviceMetadata,
    service?.id as ServiceId
  );
  const footer2 = O.isSome(maybeCtas) && (
    // Added a wrapper to enable the usage of the component outside the Container of Native Base
    <View style={styles.footerContainer} pointerEvents={"box-none"}>
      <View testID={"CtaBar_withCTA"} style={[IOStyles.footer, IOStyles.row]}>
        <ExtractedCTABar
          ctas={maybeCtas.value}
          xsmall={false}
          dispatch={dispatch}
          serviceMetadata={serviceMetadata}
          service={service?.raw}
        />
      </View>
    </View>
  );
  return (
    <View testID={"CtaBar_withFooter"}>
      {footer2}
      {footer1}
    </View>
  );
};

export default CtaBar;
