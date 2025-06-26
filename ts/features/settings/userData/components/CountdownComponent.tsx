import { View } from "react-native";
import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import { useCountdown } from "../../../../components/countdown/CountdownProvider";
import I18n from "../../../../i18n";
import { ProgressIndicator } from "../../../../components/ui/ProgressIndicator";

type CountdownProps = {
  visible: boolean;
  onContdownCompleted?: () => void;
};

const Countdown = (props: CountdownProps) => {
  const { visible } = props;
  const { timerCount, resetTimer, startTimer, isRunning } = useCountdown();

  useEffect(() => {
    if (timerCount === 0 && props.onContdownCompleted) {
      props.onContdownCompleted();
    }
  }, [timerCount, props]);

  useEffect(() => {
    if (!visible) {
      if (resetTimer) {
        resetTimer();
      }
    } else if (startTimer && isRunning && !isRunning()) {
      startTimer();
    }
  }, [visible, resetTimer, startTimer, isRunning]);

  if (visible) {
    return (
      <View style={{ alignItems: "center" }}>
        <VSpacer size={24} />
        <ProgressIndicator progress={(timerCount / 60) * 100} />
        <VSpacer size={8} />
        <Body weight="Regular" style={{ textAlign: "center" }} color="black">
          {I18n.t("email.newvalidate.countdowntext")}{" "}
          <Body weight="Semibold" color="black">
            {timerCount}s
          </Body>
        </Body>
      </View>
    );
  }
  return null;
};
export default Countdown;
