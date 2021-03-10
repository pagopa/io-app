import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackComponent,
  View,
  ViewStyle
} from "react-native";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Otp } from "../../../../../../definitions/cgn/Otp";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { addEvery } from "../../../../../utils/strings";
import { BaseTypography } from "../../../../../components/core/typography/BaseTypography";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import customVariables from "../../../../../theme/variables";
import { Label } from "../../../../../components/core/typography/Label";
import IconFont from "../../../../../components/ui/IconFont";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

type ProgressConfig = {
  duration: Millisecond;
  start?: number;
  end?: number;
};

type Props = {
  otp: Otp;
  progressBaseBgColor?: ViewStyle["backgroundColor"];
  progressBgColor?: ViewStyle["backgroundColor"];
  onEnd: () => void;
  progressConfig: ProgressConfig;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.white
  },
  otpContainer: {
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: 4,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 4,
    marginBottom: 4,
    justifyContent: "center",
    backgroundColor: IOColors.white,
    flexDirection: "row",
    shadowColor: "#00274e",
    borderColor: "black",
    borderRadius: 8,
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2
  },
  progressBase: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#d9d9d9",
    width: "90%",
    height: 6,
    margin: 4,
    borderRadius: 4
  },
  progress: {
    alignSelf: "flex-start",
    backgroundColor: IOColors.blue,
    width: "50%",
    height: 6,
    borderRadius: 4
  },
  remainingTimeContainer: {
    alignSelf: "center",
    marginTop: 4,
    width: "90%"
  },
  optCode: { fontSize: 30, padding: 4, marginRight: 4, textAlign: "center" }
});

// Monospace custom component
const OtpCodeComponent = (code: string) => (
  <BaseTypography color={"blue"} weight={"Bold"} fontStyle={styles.optCode}>
    {code}
  </BaseTypography>
);
// TODO considering duration from OTP (expire date)
// if (now - expire < 0 || now - expire > ttl ) -> use ttl
// copy for whole component (use io-copy as icon)
export const OtpCodeRefreshComponent = (props: Props) => {
  const { start = 0, end = 100, duration } = props.progressConfig;
  const formattedCode = addEvery(props.otp.code, " ", 3);
  const [translateX] = useState(new Animated.Value(start));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remaningTime, setRemainingTime] = useState<
    undefined | { minutes: number; seconds: number }
  >(undefined);
  const intervalRef = useRef<undefined | number>(undefined);

  const stopInterval = () => clearInterval(intervalRef.current);
  // start the progress animation when otp changes (at startup too)
  useEffect(() => {
    setElapsedSeconds(0);
    translateX.setValue(start);
    Animated.timing(translateX, {
      useNativeDriver: false,
      toValue: end,
      duration: duration as number,
      easing: Easing.linear
    }).start(() => {
      translateX.setValue(start);
      setElapsedSeconds(cv => cv + 1);
      stopInterval();
      props.onEnd();
    });
    // eslint-disable-next-line functional/immutable-data
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(cv => cv + 1);
    }, 1000);
    return stopInterval;
  }, [props.otp.code]);

  useEffect(() => {
    const durationInSeconds = props.progressConfig.duration / 1000;
    const minutes = Math.max(
      0,
      Math.floor((durationInSeconds - elapsedSeconds) / 60)
    );
    const seconds = Math.max(
      0,
      Math.floor((durationInSeconds - elapsedSeconds) % 60)
    );
    setRemainingTime({ minutes, seconds });
  }, [elapsedSeconds]);

  return (
    <View style={styles.container}>
      <TouchableDefaultOpacity
        style={styles.otpContainer}
        onPress={() => clipboardSetStringWithFeedback(formattedCode)}
      >
        {OtpCodeComponent(formattedCode)}
        <View style={{ justifyContent: "center" }}>
          <IconFont name="io-copy" color={IOColors.blue} />
        </View>
      </TouchableDefaultOpacity>
      <View
        style={[
          styles.progressBase,
          {
            backgroundColor:
              props.progressBaseBgColor ?? styles.progressBase.backgroundColor
          }
        ]}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              backgroundColor:
                props.progressBgColor ?? styles.progress.backgroundColor
            },
            {
              width: translateX.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"]
              })
            }
          ]}
        />
      </View>
      {remaningTime && (
        <View style={styles.remainingTimeContainer}>
          <Label weight={"Regular"}>{`Valido ancora per ${
            remaningTime.minutes > 0
              ? remaningTime.minutes.toString() + " minuti "
              : ""
          }${remaningTime.seconds} secondi`}</Label>
        </View>
      )}
    </View>
  );
};
