import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { format } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, Image, Modal, StyleSheet } from "react-native";
import errorIcon from "../../../img/messages/error-message-detail-icon.png";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { H1 } from "../../components/core/typography/H1";
import { H3 } from "../../components/core/typography/H3";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";

type Props = {
  // milliseconds
  countdown?: Millisecond;
};

const styles = StyleSheet.create({
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
          <VSpacer size={24} />
          <H1>{wrongCodeText}</H1>
          <VSpacer size={24} />
          <View style={IOStyles.alignCenter}>
            <H3>{tooManyAttemptsText}</H3>
            <H3 weight="Bold">{waitMessageText}</H3>
          </View>
          <VSpacer size={24} />
          <H1>{minuteSeconds}</H1>
          <VSpacer size={24} />
        </View>
      </Modal>
    );
  };
