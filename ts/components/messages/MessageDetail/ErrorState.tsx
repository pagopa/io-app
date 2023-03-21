import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import { H1 } from "../../core/typography/H1";

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
  },

  errorStateMessageRetry: {
    marginTop: 16,
    color: customVariables.textColorDark
  },

  errorStateMessageSubmitBug: {
    marginTop: 16
  },

  errorStateFooterWrapper: {
    flex: 0,
    flexDirection: "row",
    paddingVertical: 16
  },

  errorStateCancelButton: {
    flex: 4
  },

  errorStateRetryButton: {
    flex: 8,
    marginLeft: 10
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
  <View style={styles.errorStateWrapper}>
    <View style={styles.errorStateContentWrapper}>
      <Image
        source={require("../../../../img/messages/error-message-detail-icon.png")}
      />
      <H1 style={styles.errorStateHeader}>
        {I18n.t("messageDetails.errorText")}
      </H1>
      <View style={styles.errorStateMessageData}>
        <View style={styles.erroStateMessageDataLeft}>
          <NBText numberOfLines={1}>{`ID: ${messageId}`}</NBText>
        </View>
        <View style={styles.erroStateMessageDataRight}>
          <ButtonDefaultOpacity
            xsmall={true}
            bordered={true}
            onPress={() => clipboardSetStringWithFeedback(messageId)}
          >
            <NBText>{I18n.t("clipboard.copyText")}</NBText>
          </ButtonDefaultOpacity>
        </View>
      </View>
      <NBText alignCenter={true} style={styles.errorStateMessageRetry}>
        {I18n.t("messageDetails.retryText")}
      </NBText>
      <NBText alignCenter={true} style={styles.errorStateMessageSubmitBug}>
        {I18n.t("messageDetails.submitBugText")}
      </NBText>
    </View>
    <View style={styles.errorStateFooterWrapper}>
      <ButtonDefaultOpacity
        block={true}
        cancel={true}
        onPress={goBack}
        style={styles.errorStateCancelButton}
      >
        <NBText>{I18n.t("global.buttons.cancel")}</NBText>
      </ButtonDefaultOpacity>
      <ButtonDefaultOpacity
        block={true}
        primary={true}
        onPress={onRetry}
        style={styles.errorStateRetryButton}
      >
        <NBText>{I18n.t("global.buttons.retry")}</NBText>
      </ButtonDefaultOpacity>
    </View>
  </View>
);

export default errorState;
