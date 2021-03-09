import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "native-base";
import { Otp } from "../../../../../../definitions/cgn/Otp";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { Monospace } from "../../../../../components/core/typography/Monospace";
import { addEvery } from "../../../../../utils/strings";
import { makeFontStyleObject } from "../../../../../theme/fonts";

type Props = {
  otp: Otp;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white
  },
  optCode: {
    fontSize: 20,
    padding: 4,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select, "600", undefined, "RobotoMono")
  }
});

export const OtpCodeRefreshComponent = (props: Props) => (
  <View style={styles.container}>
    <Text style={styles.optCode}>{addEvery(props.otp.code, " ", 3)}</Text>
  </View>
);
