import { View } from "react-native";
import { Body, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useCountdown } from "../../../components/countdown/CountdownProvider";
import I18n from "../../../i18n";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";

type CountdownProps = {
  visible: boolean;
  onContdownCompleted?: () => void;
};

const Countdown = (props: CountdownProps) => {
  const { visible } = props;
  const { timerCount, resetTimer, startTimer, isRunning } = useCountdown();

  if (timerCount === 0 && props.onContdownCompleted) {
    props.onContdownCompleted();
  }

  if (!visible) {
    if (resetTimer) {
      resetTimer();
    }

    return null;
  } else if (startTimer && isRunning && !isRunning()) {
    startTimer();
  }

  if (visible) {
    return (
      <View style={IOStyles.alignCenter}>
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
