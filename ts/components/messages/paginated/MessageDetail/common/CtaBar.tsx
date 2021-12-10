import { View as NBView } from "native-base";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { CommonServiceMetadata } from "../../../../../../definitions/backend/CommonServiceMetadata";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { useIODispatch } from "../../../../../store/hooks";
import {
  getPaymentExpirationInfo,
  PaymentData,
  UIMessageDetails
} from "../../../../../store/reducers/entities/messages/types";
import { UIService } from "../../../../../store/reducers/entities/services/types";
import variables from "../../../../../theme/variables";

import {
  getMessageCTA,
  isExpired,
  MessagePaymentExpirationInfo
} from "../../../../../utils/messages";
import ExtractedCTABar from "../../../../cta/ExtractedCTABar";
import CalendarEventButton from "../../../CalendarEventButton";
import PaymentButton from "../../../PaymentButton";

type Props = {
  isPaid: boolean;
  messageDetails: UIMessageDetails;
  service?: UIService;
  serviceMetadata?: CommonServiceMetadata;
  // For retro-compatibility and use a custom padding bottom if the component is outside the SafeAreaView
  legacySafeArea?: boolean;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  legacySafeArea: {
    paddingBottom: Platform.OS === "ios" && DeviceInfo.hasNotch() ? 28 : 15
  },
  footerContainer: {
    overflow: "hidden",
    marginTop: -variables.footerShadowOffsetHeight,
    paddingTop: variables.footerShadowOffsetHeight
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
  messageDetails,
  service,
  serviceMetadata,
  legacySafeArea
}: Props): React.ReactElement | null => {
  const dispatch = useIODispatch();
  // in case of medical prescription, we shouldn't render the CtaBar
  if (messageDetails.prescriptionData !== undefined) {
    return null;
  }
  const expirationInfo = getPaymentExpirationInfo(messageDetails);
  const { dueDate, markdown, paymentData, raw: legacyMessage } = messageDetails;

  const paymentButton = renderPaymentButton(paymentData);
  const calendarButton = renderCalendarEventButton(
    isPaid,
    expirationInfo,
    legacyMessage,
    dueDate
  );

  const footerStyle = [styles.row, legacySafeArea ? styles.legacySafeArea : {}];

  const footer1 = (paymentButton || calendarButton) && (
    // Added a wrapper to enable the usage of the component outside the Container of Native Base
    <NBView style={styles.footerContainer} pointerEvents={"box-none"}>
      <NBView footer={true} style={footerStyle}>
        {calendarButton}
        {paymentButton && calendarButton && <NBView hspacer={true} />}
        {paymentButton}
      </NBView>
    </NBView>
  );
  const maybeCtas = getMessageCTA(
    markdown,
    serviceMetadata,
    service?.id as ServiceId
  );
  const footer2 = maybeCtas.isSome() && (
    // Added a wrapper to enable the usage of the component outside the Container of Native Base
    <NBView style={styles.footerContainer} pointerEvents={"box-none"}>
      <NBView testID={"CtaBar_withCTA"} footer={true} style={footerStyle}>
        <ExtractedCTABar
          ctas={maybeCtas.value}
          xsmall={false}
          dispatch={dispatch}
          serviceMetadata={serviceMetadata}
          service={service?.raw}
        />
      </NBView>
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
