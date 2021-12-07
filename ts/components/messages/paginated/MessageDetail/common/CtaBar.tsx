import { View as NBView } from "native-base";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import { ServicePublicService_metadata } from "../../../../../../definitions/backend/ServicePublic";
import {
  getMessageCTA,
  isExpired,
  MessagePaymentExpirationInfo
} from "../../../../../utils/messages";
import {
  PaymentData,
  UIMessageDetails
} from "../../../../../store/reducers/entities/messages/types";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { UIService } from "../../../../../store/reducers/entities/services/types";
import ExtractedCTABar from "../../../../cta/ExtractedCTABar";
import { useIODispatch } from "../../../../../store/hooks";
import PaymentButton from "../../../PaymentButton";
import CalendarEventButton from "../../../CalendarEventButton";

type Props = {
  expirationInfo: MessagePaymentExpirationInfo;
  isPaid: boolean;
  isPrescription: boolean;
  messageDetails: UIMessageDetails;
  service?: UIService;
  serviceMetadata?: ServicePublicService_metadata;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" && DeviceInfo.hasNotch() ? 28 : 15
  }
});

// return a payment button only when the advice is not paid and the payment_data is defined
const renderPaymentButton = (paymentData?: PaymentData) => {
  if (paymentData === undefined) {
    return null;
  }
  const { amount, noticeNumber, payee } = paymentData;
  return (
    <PaymentButton
      amount={amount}
      noticeNumber={noticeNumber}
      organizationFiscalCode={payee.fiscalCode}
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
  expirationInfo,
  isPrescription,
  messageDetails,
  service,
  serviceMetadata
}: Props): React.ReactElement | null => {
  const dispatch = useIODispatch();
  // in case of medical prescription, we shouldn't render the CtaBar
  if (isPrescription) {
    return null;
  }

  const { dueDate, markdown, paymentData, raw: legacyMessage } = messageDetails;

  const paymentButton = renderPaymentButton(paymentData);
  const calendarButton = renderCalendarEventButton(
    isPaid,
    expirationInfo,
    legacyMessage,
    dueDate
  );

  const footer1 = (paymentButton || calendarButton) && (
    <NBView footer={true} style={styles.row}>
      {calendarButton}
      {paymentButton && calendarButton && <NBView hspacer={true} />}
      {paymentButton}
    </NBView>
  );
  const maybeCtas = getMessageCTA(
    markdown,
    serviceMetadata,
    service?.id as ServiceId
  );
  const footer2 = maybeCtas.isSome() && (
    <NBView testID={"CtaBar_withCTA"} footer={true} style={styles.row}>
      <ExtractedCTABar
        ctas={maybeCtas.value}
        xsmall={false}
        dispatch={dispatch}
        serviceMetadata={serviceMetadata}
        service={service?.raw}
      />
    </NBView>
  );
  return (
    <NBView testID={"CtaBar_withFooter"}>
      {footer2}
      {footer1}
    </NBView>
  );
};

export default CtaBar;
