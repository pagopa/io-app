import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as React from "react";
import * as O from "fp-ts/lib/Option";
import { View, Modal, StyleSheet, SafeAreaView } from "react-native";
import {
  ContentWrapper,
  LabelSmall,
  Pictogram,
  ProgressLoader,
  VSpacer
} from "@pagopa/io-app-design-system";
import { H3 } from "../../components/core/typography/H3";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { identificationHideLockModal } from "../../store/actions/identification";
import { IOStyleVariables } from "../../components/core/variables/IOStyleVariables";
import {
  CountdownProvider,
  useCountdown
} from "../../components/countdown/CountdownProvider";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { identificationFailSelector } from "../../store/reducers/identification";

type Props = {
  // milliseconds
  countdown?: Millisecond;
};

const styles = StyleSheet.create({
  container: {
    ...IOStyles.bgWhite,
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  },
  contentTitle: {
    textAlign: "center"
  },
  content: {
    alignItems: "center"
  }
});

const waitMessageText = I18n.t("identification.fail.waitMessage");
const tooManyAttemptsText = I18n.t("identification.fail.tooManyAttempts");

const TIMER_INTERVAL = 1000;

type CountdownProps = {
  onElapsedTimer: () => void;
};

const Countdown = (props: CountdownProps) => {
  const { timerCount, startTimer } = useCountdown();
  const onElapsedTimer = props.onElapsedTimer;
  const timerCountRef = React.useRef(timerCount);
  const loaderValue = Math.round((timerCount * 100) / timerCountRef.current);

  useOnFirstRender(() => {
    startTimer?.();
  });

  React.useEffect(() => {
    if (timerCount === 0) {
      onElapsedTimer();
    }
  }, [onElapsedTimer, timerCount]);

  return (
    <>
      <ProgressLoader progress={loaderValue} />
      <VSpacer size={8} />
      <View style={IOStyles.row}>
        <LabelSmall color="black" weight="Regular">
          {waitMessageText}
        </LabelSmall>
        <LabelSmall color="black"> {timerCount}</LabelSmall>
      </View>
    </>
  );
};

/*
  This modal screen is displayed when too many wrong pin attempts have been made.
  A countdown is displayed indicating how long it is to unlock the application.
*/
export const IdentificationLockModal = (props: Props) => {
  const { countdown } = props;
  const timerTiming = (countdown as number) / 1000;

  const dispatch = useIODispatch();
  const hideModal = React.useCallback(() => {
    dispatch(identificationHideLockModal());
  }, [dispatch]);

  return (
    <Modal>
      <SafeAreaView style={styles.container}>
        <ContentWrapper>
          <View style={styles.content}>
            <Pictogram name="accessDenied" />
            <VSpacer
              size={IOStyleVariables.defaultSpaceBetweenPictogramAndText}
            />
            <H3
              style={styles.contentTitle}
              accessibilityLabel={tooManyAttemptsText}
            >
              {tooManyAttemptsText}
            </H3>
            <VSpacer size={32} />
            <CountdownProvider
              timerTiming={timerTiming}
              intervalDuration={TIMER_INTERVAL}
            >
              <Countdown onElapsedTimer={hideModal} />
            </CountdownProvider>
          </View>
        </ContentWrapper>
      </SafeAreaView>
    </Modal>
  );
};
