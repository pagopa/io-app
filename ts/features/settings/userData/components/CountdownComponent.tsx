import { Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";
import { View } from "react-native";

import { useCountdown } from "../../../../components/countdown/CountdownProvider";
import { ProgressIndicator } from "../../../../components/ui/ProgressIndicator";

type CountdownProps = {
  onContdownCompleted?: () => void;
  visible: boolean;
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
        {/* Adding this due to https://github.com/facebook/react-native/issues/47635 */}
        <ProgressIndicator progress={Math.floor((timerCount / 60) * 100)} />
        <VSpacer size={8} />
        <Body color="black" style={{ textAlign: "center" }} weight="Regular">
          {I18n.t("email.newvalidate.countdowntext")}{" "}
          <Body color="black" weight="Semibold">
            {timerCount}s
          </Body>
        </Body>
      </View>
    );
  }
  return null;
};
export default Countdown;
