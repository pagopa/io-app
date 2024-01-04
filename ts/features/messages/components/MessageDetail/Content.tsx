import React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import customVariables from "../../../../theme/variables";
import { convertDateTimeToWordDistance } from "../../utils/convertDateToWordDistance";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { Body } from "../../../../components/core/typography/Body";
import { Label } from "../../../../components/core/typography/Label";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import EmailCallCTA from "../../../../components/screens/EmailCallCTA";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.greyUltraLight,
    padding: customVariables.contentPadding
  },
  textWrap: {
    flex: 1,
    flexWrap: "wrap"
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
        <Body>{`${I18n.t("messageDetails.dateSending")} `}</Body>
        <Label
          style={styles.textWrap}
          color="bluegrey"
        >{`${convertDateTimeToWordDistance(message.createdAt)}`}</Label>
      </View>

      <View style={[IOStyles.flex, IOStyles.row]}>
        <Body>{`${I18n.t("messageDetails.sender")} `}</Body>
        <Label style={styles.textWrap} color="bluegrey">
          {message.organizationName}
        </Label>
      </View>

      <View style={[IOStyles.flex, IOStyles.row]}>
        <Body>{`${I18n.t("messageDetails.service")} `}</Body>
        <Link
          weight={"Bold"}
          style={styles.textWrap}
          onPress={goToServiceDetail}
        >
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
