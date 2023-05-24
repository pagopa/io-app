import { Millisecond, Second } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View, ViewStyle } from "react-native";
import { Otp } from "../../../../../../../definitions/cgn/Otp";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import { isTestEnv } from "../../../../../../utils/environment";
import { addEvery } from "../../../../../../utils/strings";
import { Icon } from "../../../../../../components/core/icons";

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
    marginVertical: 4,
    justifyContent: "space-between",
    backgroundColor: IOColors.white,
    flexDirection: "row"
  },
  progressBase: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: IOColors.bluegreyLight,
    width: "100%",
    height: 2,
    margin: 4,
    borderRadius: 4
  },
  progress: {
    alignSelf: "flex-start",
    backgroundColor: IOColors.blue,
    width: "50%",
    height: 2,
    borderRadius: 4
  },
  remainingTimeContainer: {
    alignSelf: "center",
    width: "100%"
  },
  optCode: { fontSize: 16, textAlign: "left" }
});

// Monospace custom component
const OtpCode = (code: string) => (
  <BaseTypography
    color={"bluegrey"}
    weight={"Regular"}
    fontStyle={styles.optCode}
    font={"RobotoMono"}
  >
    {code}
  </BaseTypography>
);

type ExpirationTime = { minutes: number; seconds: number };

/**
 * compute otp code expiration time
 * - if the otp elapsed time is before the current time, the remaining time is ttl
 * - if the otp elapsed time is after the current time, the remaining time is the minimum between now - elapsed time and ttl
 */
const getOtpTTL = (otp: Otp): Millisecond => {
  const now = new Date();
  const expiration = otp.expires_at.getTime() - now.getTime();
  if (expiration > 0) {
    // take the min between ttl and computed seconds
    return Math.min(Math.ceil(expiration), otp.ttl * 1000) as Millisecond;
  }
  // expires is in the past relative to the dice current time, use ttl as fallback
  return (otp.ttl * 1000) as Millisecond;
};

// return a string (or undefined) of the remaining time
const getRemainingTimeRepr = (
  expirationtime: ExpirationTime
): string | undefined =>
  pipe(
    expirationtime,
    O.fromNullable,
    O.map(rt => {
      const minutes =
        rt.minutes === 0
          ? ""
          : I18n.t("bonus.cgn.otp.code.minutes", {
              defaultValue: I18n.t("bonus.cgn.otp.code.minutes.other", {
                minutes: rt.minutes
              }),
              count: rt.minutes,
              minutes: rt.minutes
            }) + " ";
      const seconds = I18n.t("bonus.cgn.otp.code.seconds", {
        defaultValue: I18n.t("bonus.cgn.otp.code.seconds.other", {
          seconds: rt.seconds
        }),
        count: rt.seconds,
        seconds: rt.seconds
      });
      return `${I18n.t("bonus.cgn.otp.code.validUntil")} ${minutes}${seconds}`;
    }),
    O.toUndefined
  );

export const OtpCodeComponent = (props: Props) => {
  const { startPercentage, endPercentage } = props.progressConfig ?? {
    startPercentage: 0,
    endPercentage: 100
  };
  const [progressWidth] = useState(new Animated.Value(startPercentage));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [duration, setDuration] = useState<Second>(0 as Second);
  const [expirationTime, setExpirationTime] = useState<
    ExpirationTime | undefined
  >(undefined);
  const intervalRef = useRef<undefined | number>(undefined);
  const formattedCode = addEvery(props.otp.code, " ", 3);

  // reset interval timer
  const stopInterval = () => clearInterval(intervalRef.current);

  const { otp, onEnd } = props;

  /**
   * when otp changes
   * - reset elapsed seconds
   * - reset progress width
   * - start progress width animation
   */
  useEffect(() => {
    const currentDuration = getOtpTTL(otp);
    setDuration((currentDuration / 1000) as Second);
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
      onEnd();
    });
    // eslint-disable-next-line functional/immutable-data
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(cv => cv + 1);
    }, 1000);
    return stopInterval;
  }, [otp, onEnd, progressWidth, startPercentage, endPercentage]);

  // update the remaining time
  useEffect(() => {
    if (duration === 0) {
      return;
    }
    const expiration = duration - elapsedSeconds;
    const minutes = Math.max(0, Math.floor(expiration / 60));
    const seconds = Math.max(0, Math.floor(expiration % 60));
    setExpirationTime({ minutes, seconds });
  }, [duration, elapsedSeconds]);

  return (
    <View style={styles.container}>
      <TouchableDefaultOpacity
        style={styles.otpContainer}
        onPress={() => clipboardSetStringWithFeedback(props.otp.code)}
        accessible={true}
        accessibilityRole={"button"}
        accessibilityHint={I18n.t("bonus.cgn.accessibility.code")}
      >
        {OtpCode(formattedCode)}
        <View style={{ justifyContent: "center" }}>
          <Icon name="copy" color="blue" />
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
      {expirationTime && (
        <View style={styles.remainingTimeContainer}>
          <H5 weight={"Regular"} color={"bluegrey"}>
            {getRemainingTimeRepr(expirationTime)}
          </H5>
        </View>
      )}
    </View>
  );
};

// keep encapsulation strong
export const testableOtpCodeRefreshComponent = isTestEnv
  ? { getOtpTTL }
  : undefined;
