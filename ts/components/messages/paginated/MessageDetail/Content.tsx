import I18n from "i18n-js";
import { Text as NBText, View as NBView } from "native-base";
import React from "react";
import { StyleSheet, View } from "react-native";

import customVariables from "../../../../theme/variables";
import { format, formatDateAsLocal } from "../../../../utils/dates";
import CopyButtonComponent from "../../../CopyButtonComponent";
import { Link } from "../../../core/typography/Link";
import EmailCallCTA from "../../../screens/EmailCallCTA";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";

const styles = StyleSheet.create({
  container: {
    backgroundColor: customVariables.brandGray,
    padding: customVariables.contentPadding
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flex: {
    flex: 1,
    alignSelf: "center"
  },
  section: {
    flex: 1,
    flexDirection: "row"
  },
  sectionValue: {
    flex: 1
  }
});

type Props = Readonly<{
  message: UIMessage;
  serviceContacts: { phone?: string; email?: string };
  goToServiceDetail?: () => void;
}>;

/**
 * A component to render a summary of data about the message and the related service.
 * If data are available, the user can start a call or send and email to the service
 */
const Content = ({ message, goToServiceDetail, serviceContacts }: Props) => {
  const { phone, email } = serviceContacts;
  const date = formatDateAsLocal(message.createdAt);
  const time = format(message.createdAt, "HH.mm");
  const textToCopy: string = `${message.serviceName} - ${message.id}`;
  const hasEmailOrPhone = phone !== undefined || email !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <NBText>{I18n.t("messageDetails.dateSending")}</NBText>
        <NBText
          style={styles.sectionValue}
          bold={true}
        >{` ${date} - ${time}`}</NBText>
      </View>

      <View style={styles.section}>
        <NBText>{I18n.t("messageDetails.sender")}</NBText>
        <NBText
          style={styles.sectionValue}
          bold={true}
        >{` ${message.organizationName}`}</NBText>
      </View>

      <View style={styles.section}>
        <NBText>{`${I18n.t("messageDetails.service")} `}</NBText>
        <Link
          weight={"Bold"}
          style={styles.sectionValue}
          onPress={goToServiceDetail}
        >
          {message.serviceName}
        </Link>
      </View>

      {hasEmailOrPhone && (
        <>
          <NBView spacer={true} />

          <NBText bold={true}>{I18n.t("messageDetails.question")}</NBText>
          <NBView spacer={true} xsmall={true} />

          <NBText>{I18n.t("messageDetails.answer")}</NBText>
          <NBView spacer={true} />

          <View style={styles.row}>
            <NBText style={styles.flex}>{`${I18n.t("messageDetails.id")} ${
              message.id
            }`}</NBText>
            <CopyButtonComponent textToCopy={textToCopy} />
          </View>
          <NBView spacer={true} />

          <EmailCallCTA phone={phone} email={email} />
          <NBView spacer={true} small={true} />
        </>
      )}
    </View>
  );
};

export default Content;
