import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View, ViewStyle } from "react-native";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Otp } from "../../../../../../definitions/cgn/Otp";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { addEvery } from "../../../../../utils/strings";
import { BaseTypography } from "../../../../../components/core/typography/BaseTypography";
import customVariables from "../../../../../theme/variables";
import { Label } from "../../../../../components/core/typography/Label";
import IconFont from "../../../../../components/ui/IconFont";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { isTestEnv } from "../../../../../utils/environment";

type ProgressConfig = {
  startPercentage: number;
  endPercentage: number;
};

type Props = {
  otp: Otp;
  progressBaseBgColor?: ViewStyle["backgroundColor"];
  progressBgColor?: ViewStyle["backgroundColor"];
  onEnd: () => void;
  progressConfig?: ProgressConfig;
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
    marginTop: 2,
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

const getOtpTTL = (otp: Otp): Millisecond => {
  const now = new Date();
  const remain = otp.expires_at.getTime() - now.getTime();
  if (remain > 0) {
    // take the min between ttl and computed seconds
    return Math.min(Math.ceil(remain), otp.ttl * 1000) as Millisecond;
  }
  // expires is in the past relative to the dice current time, use ttl as fallback
  return (otp.ttl * 1000) as Millisecond;
};

// TODO considering duration from OTP (expire date)
// if (now - expire < 0 || now - expire > ttl ) -> use ttl
export const OtpCodeRefreshComponent = (props: Props) => {
  const { startPercentage, endPercentage } = props.progressConfig ?? {
    startPercentage: 0,
    endPercentage: 100
  };
  const [progressWidth] = useState(new Animated.Value(startPercentage));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [remainingTime, setRemainingTime] = useState<
    undefined | { minutes: number; seconds: number }
  >(undefined);
  const intervalRef = useRef<undefined | number>(undefined);
  const formattedCode = addEvery(props.otp.code, " ", 3);

  // reset interval timer
  const stopInterval = () => clearInterval(intervalRef.current);

  /**
   * when otp changes
   * - reset elapsed seconds
   * - reset progress width
   * - start progress width animation
   */
  useEffect(() => {
    const currentDuration = getOtpTTL(props.otp);
    setDuration(currentDuration);
    setElapsedSeconds(0);
    progressWidth.setValue(startPercentage);

    Animated.timing(progressWidth, {
      useNativeDriver: false,
      toValue: endPercentage,
      duration: currentDuration as number,
      easing: Easing.linear
    }).start(() => {
      // when animation end
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

  // update the remaining time
  useEffect(() => {
    if (duration === 0) {
      return;
    }
    const durationInSeconds = duration / 1000;
    const minutes = Math.max(
      0,
      Math.floor((durationInSeconds - elapsedSeconds) / 60)
    );
    const seconds = Math.max(
      0,
      Math.floor((durationInSeconds - elapsedSeconds) % 60)
    );
    setRemainingTime({ minutes, seconds });
  }, [duration, elapsedSeconds]);

  return (
    <View style={styles.container}>
      <View style={styles.remainingTimeContainer}>
        <Label weight={"Regular"} color={"bluegrey"}>
          {"Il tuo codice sconto"}
        </Label>
      </View>
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
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"]
              })
            }
          ]}
        />
      </View>
      {remainingTime && (
        <View style={styles.remainingTimeContainer}>
          <Label weight={"Regular"} color={"bluegrey"}>{`Valido ancora per ${
            remainingTime.minutes > 0
              ? remainingTime.minutes.toString() + " minuti "
              : ""
          }${remainingTime.seconds} secondi`}</Label>
        </View>
      )}
    </View>
  );
};

// keep encapsulation strong
export const testableOtpCodeRefreshComponent = isTestEnv
  ? { getOtpTTL }
  : undefined;
