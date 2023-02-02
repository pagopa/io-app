import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { convertDateTimeToWordDistance } from "../../../utils/convertDateToWordDistance";
import CopyButtonComponent from "../../CopyButtonComponent";
import { HSpacer, VSpacer } from "../../core/spacer/Spacer";
import { Body } from "../../core/typography/Body";
import { Label } from "../../core/typography/Label";
import { Link } from "../../core/typography/Link";
import { IOColors } from "../../core/variables/IOColors";
import { IOStyles } from "../../core/variables/IOStyles";
import EmailCallCTA from "../../screens/EmailCallCTA";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.greyUltraLight,
    padding: customVariables.contentPadding
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
      <View style={[IOStyles.flex, IOStyles.row]}>
        <Body>{I18n.t("messageDetails.dateSending")}</Body>
        <Label color="bluegrey">{` ${convertDateTimeToWordDistance(
          message.createdAt
        )}`}</Label>
      </View>

      <View style={[IOStyles.flex, IOStyles.row]}>
        <Body>{I18n.t("messageDetails.sender")}</Body>
        <Label color="bluegrey">{` ${message.organizationName}`}</Label>
      </View>

      <View style={[IOStyles.flex, IOStyles.row]}>
        <Body>{`${I18n.t("messageDetails.service")} `}</Body>
        <Link weight={"Bold"} style={IOStyles.flex} onPress={goToServiceDetail}>
          {message.serviceName}
        </Link>
      </View>

      {hasEmailOrPhone && (
        <>
          <VSpacer size={16} />
          <Label color="bluegrey">{I18n.t("messageDetails.question")}</Label>

          <VSpacer size={4} />
          <Body>{I18n.t("messageDetails.answer")}</Body>

          <VSpacer size={16} />
          <View style={IOStyles.rowSpaceBetween}>
            <View style={[IOStyles.flex, IOStyles.selfCenter]}>
              <Body>{`${I18n.t("messageDetails.id")} ${message.id}`}</Body>
            </View>
            <HSpacer size={16} />
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
