import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { format } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Image, Modal, StyleSheet } from "react-native";
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
    const minuteSeconds = pipe(
      props.countdown,
      O.fromNullable,
      O.fold(
        () => "0:00",
        x => fromMillisecondsToTimeRepresentation(x)
      )
    );

    return (
      <Modal>
        <View style={styles.spaced}>
          <View style={styles.imageContainer}>
            <Image source={errorIcon} />
          </View>

          <NBText bold={true} style={styles.title}>
            {wrongCodeText}
          </NBText>
          <NBText style={styles.text}>{tooManyAttemptsText}</NBText>
          <NBText bold={true} style={styles.text}>
            {waitMessageText}
          </NBText>
          <NBText bold={true} style={styles.title}>
            {minuteSeconds}
          </NBText>
        </View>
      </Modal>
    );
  };
