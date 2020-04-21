import { fromNullable } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { Image, Modal, StyleSheet } from "react-native";
import I18n from "../../i18n";

type Props = {
  // milliseconds
  countdown?: number;
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

const errorIcon = require("../../../img/messages/error-message-detail-icon.png");

const wrongCodeText = I18n.t("identification.fail.wrongCode");
const waitMessageText = I18n.t("identification.fail.waitMessage");
const tooManyAttemptsText = I18n.t("identification.fail.tooManyAttempts");

// Convert milliseconds to a textual representation based on mm:ss

const fromMillisecondsToTimeRepresentation = (milliseconds: number): string => {
  const roundedMs = 1000 * Math.round(milliseconds / 1000);
  const minutes = Math.floor(roundedMs / 60000).toString();
  const seconds = (roundedMs % 60000) / 1000;

  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds.toFixed(0);
};

/*
  This modal screen is displayed when too many wrong pin attempts have been made.
  A countdown is displayed indicating how long it is to unlock the application.
*/

export const IdentificationLockModal: React.FunctionComponent<
  Props
> = props => {
  const minuteSeconds = fromNullable(props.countdown).fold(
    "0:00",
    fromMillisecondsToTimeRepresentation
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
