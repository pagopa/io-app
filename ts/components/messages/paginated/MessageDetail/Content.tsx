import I18n from "i18n-js";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

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
  service: {
    display: "flex",
    flexDirection: "row"
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
      <Text>
        {I18n.t("messageDetails.dateSending")}
        <Text bold={true}>{` ${date} - ${time}`}</Text>
      </Text>

      <Text>
        {I18n.t("messageDetails.sender")}
        <Text bold={true}>{` ${message.organizationName}`}</Text>
      </Text>

      <View style={styles.service}>
        <Text>{`${I18n.t("messageDetails.service")} `}</Text>
        <Link weight={"Bold"} onPress={goToServiceDetail}>
          {message.serviceName}
        </Link>
      </View>

      {hasEmailOrPhone && (
        <>
          <View spacer={true} />

          <Text bold={true}>{I18n.t("messageDetails.question")}</Text>
          <View spacer={true} xsmall={true} />

          <Text>{I18n.t("messageDetails.answer")}</Text>
          <View spacer={true} />

          <View style={styles.row}>
            <Text style={styles.flex}>{`${I18n.t("messageDetails.id")} ${
              message.id
            }`}</Text>
            <CopyButtonComponent textToCopy={textToCopy} />
          </View>
          <View spacer={true} />

          <EmailCallCTA phone={phone} email={email} />
          <View spacer={true} small={true} />
        </>
      )}
    </View>
  );
};

export default Content;
