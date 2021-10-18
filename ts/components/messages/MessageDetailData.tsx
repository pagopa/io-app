import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Timestamp } from "../../../definitions/backend/Timestamp";
import customVariables from "../../theme/variables";
import { format, formatDateAsLocal } from "../../utils/dates";
import I18n from "../../i18n";
import CopyButtonComponent from "../CopyButtonComponent";
import { Link } from "../core/typography/Link";
import EmailCallCTA from "../screens/EmailCallCTA";

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
  goToServiceDetail?: () => void;
  messageCreatedAt: Timestamp;
  messageId: string;
  organizationName?: string;
  serviceEmail?: string;
  serviceName?: string;
  servicePhone?: string;
}>;

/**
 * A component to render a summary of data about the message and the related service.
 * If data are available, the user can start a call or send and email to the service
 */
const MessageDetailData = ({
  goToServiceDetail,
  messageCreatedAt,
  messageId,
  organizationName,
  serviceEmail,
  serviceName,
  servicePhone
}: Props) => {
  const textToCopy: string = serviceName
    ? `${serviceName} - ${messageId}`
    : messageId;

  const hasEmailOrPhone =
    serviceEmail !== undefined || servicePhone !== undefined;

  const date = formatDateAsLocal(messageCreatedAt);
  const time = format(messageCreatedAt, "HH.mm");

  return (
    <View style={styles.container}>
      <Text>
        {I18n.t("messageDetails.dateSending")}
        <Text bold={true}>{` ${date} - ${time}`}</Text>
      </Text>

      {organizationName && (
        <Text>
          {I18n.t("messageDetails.sender")}
          <Text bold={true}>{` ${organizationName}`}</Text>
        </Text>
      )}

      {serviceName && (
        <View style={styles.service}>
          <Text>{`${I18n.t("messageDetails.service")} `}</Text>
          <Link weight={"Bold"} onPress={goToServiceDetail}>
            {serviceName}
          </Link>
        </View>
      )}
      {hasEmailOrPhone && (
        <React.Fragment>
          <View spacer={true} />

          <Text bold={true}>{I18n.t("messageDetails.question")}</Text>
          <View spacer={true} xsmall={true} />
          <Text>{I18n.t("messageDetails.answer")}</Text>

          <View spacer={true} />

          <React.Fragment>
            <View style={styles.row}>
              <Text style={styles.flex}>{`${I18n.t(
                "messageDetails.id"
              )} ${messageId}`}</Text>
              <CopyButtonComponent textToCopy={textToCopy} />
            </View>
            <View spacer={true} />
          </React.Fragment>
          <EmailCallCTA phone={servicePhone} email={serviceEmail} />
          <View spacer={true} small={true} />
        </React.Fragment>
      )}
    </View>
  );
};

export default MessageDetailData;
