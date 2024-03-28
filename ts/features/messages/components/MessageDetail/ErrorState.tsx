import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";

const styles = StyleSheet.create({
  errorStateWrapper: {
    flex: 1,
    paddingHorizontal: customVariables.contentPadding
  },
  errorStateContentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  errorStateHeader: {
    marginTop: 30,
    textAlign: "center"
  },
  errorStateMessageData: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    paddingHorizontal: customVariables.contentPadding
  },

  erroStateMessageDataLeft: {
    flex: 1
  },

  erroStateMessageDataRight: {
    flex: 0,
    paddingLeft: 10
  }
});

type Props = {
  messageId: string;
  onRetry: () => void;
  goBack: () => void;
};
/**
 * Used when something went wrong but there is a way to recover.
 * (ex. the loading of the message/service failed but we can retry)
 */
const errorState = ({ messageId, onRetry, goBack }: Props) => (
  <>
    <View style={styles.errorStateWrapper}>
      <View style={styles.errorStateContentWrapper}>
        <Image
          source={require("../../../../../img/messages/error-message-detail-icon.png")}
        />
        <H1 style={styles.errorStateHeader}>
          {I18n.t("messageDetails.errorText")}
        </H1>
        <View style={styles.errorStateMessageData}>
          <View style={styles.erroStateMessageDataLeft}>
            <Body numberOfLines={1}>{`ID: ${messageId}`}</Body>
          </View>
          <View style={styles.erroStateMessageDataRight}>
            <CopyButtonComponent textToCopy={messageId} />
          </View>
        </View>
        <VSpacer size={16} />
        <View style={IOStyles.alignCenter}>
          <Body color="bluegreyDark">{I18n.t("messageDetails.retryText")}</Body>
          <VSpacer size={16} />
          <Body color="bluegreyDark">
            {I18n.t("messageDetails.submitBugText")}
          </Body>
        </View>
      </View>
    </View>
    <FooterWithButtons
      type="TwoButtonsInlineThird"
      primary={{
        type: "Outline",
        buttonProps: {
          onPress: goBack,
          label: I18n.t("global.buttons.cancel"),
          accessibilityLabel: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          onPress: onRetry,
          label: I18n.t("global.buttons.retry"),
          accessibilityLabel: I18n.t("global.buttons.retry")
        }
      }}
    />
  </>
);

export default errorState;
