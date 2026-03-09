import {
  BodySmall,
  ContentWrapper,
  H4,
  IOColors,
  Pictogram,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { Modal, View } from "react-native";
import {
  CountdownProvider,
  useCountdown
} from "../../../components/countdown/CountdownProvider";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";
import { useIODispatch } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { identificationHideLockModal } from "../store/actions";

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
        <BodySmall weight="Regular">{waitMessageText}</BodySmall>
        <BodySmall weight="Semibold">{` ${timerCount}s`}</BodySmall>
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
    <Modal testID="identification-lock-modal">
      <View
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
      </View>
    </Modal>
  );
};
