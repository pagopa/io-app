import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { format } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, Image, Modal, StyleSheet } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import errorIcon from "../../../img/messages/error-message-detail-icon.png";
import { H1 } from "../../components/core/typography/H1";
import { H3 } from "../../components/core/typography/H3";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";
import { useIODispatch } from "../../store/hooks";
import { identificationHideLockModal } from "../../store/actions/identification";

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

export const IdentificationLockModal: React.FunctionComponent<
  Props
> = props => {
  const { countdown } = props;
  const timerId = React.useRef<number | null>();
  const [countdownValue, setCountdownValue] = React.useState(
    (countdown as number) ?? 0
  );

  const dispatch = useIODispatch();
  const hideModal = React.useCallback(() => {
    dispatch(identificationHideLockModal());
  }, [dispatch]);

  const minuteSeconds = pipe(
    countdownValue as Millisecond,
    O.fromNullable,
    O.fold(
      () => "0:00",
      x => fromMillisecondsToTimeRepresentation(x)
    )
  );

  React.useEffect(() => {
    if (countdownValue <= 0) {
      hideModal();
    }
  }, [countdownValue, hideModal]);

  React.useEffect(() => {
    console.log("⏱️ countdownValue", countdownValue);
    if (countdownValue > 0) {
      // eslint-disable-next-line functional/immutable-data
      timerId.current = setInterval(() => {
        setCountdownValue(currentValue => currentValue - 1000);
      }, 1000);
    }
    return () => {
      console.log("🧹 Clearing timer");
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, [countdownValue, props]);

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
