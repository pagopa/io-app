import { format } from "date-fns";
import { fromNullable } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Text, View } from "native-base";
import * as React from "react";
import { Image, Modal, StyleSheet } from "react-native";
import errorIcon from "../../../img/messages/error-message-detail-icon.png";
import I18n from "../../i18n";

type Props = {
  // milliseconds
  countdown?: Millisecond;
};

const styles = StyleSheet.create({
  title: {
    paddingVertical: 24,
    fontSize: 24
  },
  text: {
    fontSize: 18,
    textAlign: "center"
  },
  imageContainer: {
    paddingTop: 96
  },
  spaced: {
    flexDirection: "column",
    alignItems: "center"
  }
});

const wrongCodeText = I18n.t("global.genericRetry");
const waitMessageText = I18n.t("identification.fail.waitMessage");
const tooManyAttemptsText = I18n.t("identification.fail.tooManyAttempts");

// Convert milliseconds to a textual representation based on mm:ss

const fromMillisecondsToTimeRepresentation = (ms: Millisecond): string =>
  format(new Date(ms), "mm:ss");

/*
  This modal screen is displayed when too many wrong pin attempts have been made.
  A countdown is displayed indicating how long it is to unlock the application.
*/

export const IdentificationLockModal: React.FunctionComponent<Props> =
  props => {
    const minuteSeconds = fromNullable(props.countdown).fold("0:00", x =>
      fromMillisecondsToTimeRepresentation(x)
    );

    return (
      <Modal>
        <View style={styles.spaced}>
          <View style={styles.imageContainer}>
            <Image source={errorIcon} />
          </View>

          <Text bold={true} style={styles.title}>
            {wrongCodeText}
          </Text>
          <Text style={styles.text}>{tooManyAttemptsText}</Text>
          <Text bold={true} style={styles.text}>
            {waitMessageText}
          </Text>
          <Text bold={true} style={styles.title}>
            {minuteSeconds}
          </Text>
        </View>
      </Modal>
    );
  };
