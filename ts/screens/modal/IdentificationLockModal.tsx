import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useCallback, useEffect } from "react";
import { View, Modal, SafeAreaView } from "react-native";
import {
  ContentWrapper,
  H4,
  BodySmall,
  Pictogram,
  VSpacer,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import { useIODispatch } from "../../store/hooks";
import { identificationHideLockModal } from "../../store/actions/identification";
import {
  CountdownProvider,
  useCountdown
} from "../../components/countdown/CountdownProvider";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { ProgressIndicator } from "../../components/ui/ProgressIndicator";

type Props = {
  countdownInMs: Millisecond;
  timeSpanInSeconds: number;
};

const waitMessageText = I18n.t("identification.fail.waitMessage");
const tooManyAttemptsText = I18n.t("identification.fail.tooManyAttempts");

const TIMER_INTERVAL = 1000;

type CountdownProps = {
  onElapsedTimer: () => void;
  timeSpanInSeconds: number;
};

const Countdown = (props: CountdownProps) => {
  const { timerCount, startTimer } = useCountdown();
  const { onElapsedTimer, timeSpanInSeconds } = props;
  const loaderValue = Math.round((timerCount * 100) / timeSpanInSeconds);

  useOnFirstRender(() => {
    startTimer?.();
  });

  useEffect(() => {
    if (timerCount === 0) {
      onElapsedTimer();
    }
  }, [onElapsedTimer, timerCount]);

  return (
    <>
      <ProgressIndicator progress={loaderValue} />
      <VSpacer size={8} />
      <View style={{ flexDirection: "row" }}>
        <BodySmall color="black" weight="Regular">
          {waitMessageText}
        </BodySmall>
        <BodySmall weight="Semibold" color="black">
          {` ${timerCount}s`}
        </BodySmall>
      </View>
    </>
  );
};

/*
  This modal screen is displayed when too many wrong pin attempts have been made.
  A countdown is displayed indicating how long it is to unlock the application.
*/
export const IdentificationLockModal = (props: Props) => {
  const theme = useIOTheme();
  const { countdownInMs, timeSpanInSeconds } = props;
  const timerTiming = Math.round((countdownInMs as number) / 1000);

  const dispatch = useIODispatch();
  const hideModal = useCallback(() => {
    dispatch(identificationHideLockModal());
  }, [dispatch]);

  return (
    <Modal>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: IOColors[theme["appBackground-primary"]]
        }}
      >
        <ContentWrapper>
          <View style={{ alignItems: "center" }}>
            <Pictogram name="accessDenied" />
            <VSpacer size={24} />
            <H4
              style={{ textAlign: "center" }}
              accessibilityLabel={tooManyAttemptsText}
            >
              {tooManyAttemptsText}
            </H4>
            <VSpacer size={32} />
            <CountdownProvider
              timerTiming={timerTiming}
              intervalDuration={TIMER_INTERVAL}
            >
              <Countdown
                onElapsedTimer={hideModal}
                timeSpanInSeconds={timeSpanInSeconds}
              />
            </CountdownProvider>
          </View>
        </ContentWrapper>
      </SafeAreaView>
    </Modal>
  );
};
