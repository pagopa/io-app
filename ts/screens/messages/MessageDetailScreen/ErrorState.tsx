import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { H3, Text, View } from "native-base";

import I18n from "../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import customVariables from "../../../theme/variables";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";

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
    color: customVariables.brandDarkestGray
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
      <H3 style={styles.errorStateHeader}>
        {I18n.t("messageDetails.errorText")}
      </H3>
      <View style={styles.errorStateMessageData}>
        <View style={styles.erroStateMessageDataLeft}>
          <Text numberOfLines={1}>{`ID: ${messageId}`}</Text>
        </View>
        <View style={styles.erroStateMessageDataRight}>
          <ButtonDefaultOpacity
            xsmall={true}
            bordered={true}
            onPress={() => clipboardSetStringWithFeedback(messageId)}
          >
            <Text>{I18n.t("clipboard.copyText")}</Text>
          </ButtonDefaultOpacity>
        </View>
      </View>
      <Text alignCenter={true} style={styles.errorStateMessageRetry}>
        {I18n.t("messageDetails.retryText")}
      </Text>
      <Text alignCenter={true} style={styles.errorStateMessageSubmitBug}>
        {I18n.t("messageDetails.submitBugText")}
      </Text>
    </View>
    <View style={styles.errorStateFooterWrapper}>
      <ButtonDefaultOpacity
        block={true}
        cancel={true}
        onPress={goBack}
        style={styles.errorStateCancelButton}
      >
        <Text>{I18n.t("global.buttons.cancel")}</Text>
      </ButtonDefaultOpacity>
      <ButtonDefaultOpacity
        block={true}
        primary={true}
        onPress={onRetry}
        style={styles.errorStateRetryButton}
      >
        <Text>{I18n.t("global.buttons.retry")}</Text>
      </ButtonDefaultOpacity>
    </View>
  </View>
);

export default errorState;
