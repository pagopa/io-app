import { Text as NBText } from "native-base";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { convertDateTimeToWordDistance } from "../../../utils/convertDateToWordDistance";
import CopyButtonComponent from "../../CopyButtonComponent";
import { VSpacer } from "../../core/spacer/Spacer";
import { Link } from "../../core/typography/Link";
import { IOColors } from "../../core/variables/IOColors";
import EmailCallCTA from "../../screens/EmailCallCTA";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.greyUltraLight,
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
  const textToCopy: string = `${message.serviceName} - ${message.id}`;
  const hasEmailOrPhone = phone !== undefined || email !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <NBText>{I18n.t("messageDetails.dateSending")}</NBText>
        <NBText
          style={styles.sectionValue}
          bold={true}
        >{` ${convertDateTimeToWordDistance(message.createdAt)}`}</NBText>
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
          <VSpacer size={16} />

          <NBText bold={true}>{I18n.t("messageDetails.question")}</NBText>
          <VSpacer size={4} />

          <NBText>{I18n.t("messageDetails.answer")}</NBText>
          <VSpacer size={16} />

          <View style={styles.row}>
            <NBText style={styles.flex}>{`${I18n.t("messageDetails.id")} ${
              message.id
            }`}</NBText>
            <CopyButtonComponent textToCopy={textToCopy} />
          </View>
          <VSpacer size={16} />

          <EmailCallCTA phone={phone} email={email} />
          <VSpacer size={8} />
        </>
      )}
    </View>
  );
};

export default Content;
