import {
  IOColorPalette,
  IOPictograms,
  IOText,
  Pictogram
} from "@io-app/design-system";
import { ColorValue, Platform, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { CircularProgress } from "../../../../../../components/ui/CircularProgress";
import { ReadStatus } from "../types/ReadStatus";

const pictogramMap: Record<ReadStatus, IOPictograms> = {
  idle: "smile",
  reading: Platform.select({ ios: "nfcScaniOS", default: "nfcScanAndroid" }),
  success: "success",
  error: "fatalError"
};

const statusColorMap: Record<ReadStatus, ColorValue> = {
  idle: IOColorPalette.blueIO[500],
  reading: IOColorPalette.blueIO[500],
  success: IOColorPalette.green[500],
  error: IOColorPalette.red[500]
};

type ReadStatusComponentProps = {
  progress?: number;
  status: ReadStatus;
  step?: string;
};

export const ReadStatusComponent = ({
  progress = 0,
  status,
  step
}: ReadStatusComponentProps) => (
  <Animated.View layout={LinearTransition} style={styles.statusContainer}>
    <CircularProgress
      progress={progress * 100}
      radius={125}
      size={250}
      strokeBgColor={IOColorPalette.greyscale[100]}
      strokeColor={statusColorMap[status]}
      strokeWidth={8}
    >
      <>
        <Animated.View layout={LinearTransition}>
          <Pictogram name={pictogramMap[status]} size={180} />
        </Animated.View>
        {status === "reading" && step && (
          <IOText
            color={IOColorPalette.greyscale.black}
            font="FiraCode"
            size={12}
            weight="Bold"
          >
            {step}
          </IOText>
        )}
      </>
    </CircularProgress>
  </Animated.View>
);

const styles = StyleSheet.create({
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
