import {
  IOColors,
  IOPictograms,
  IOText,
  Pictogram
} from "@pagopa/io-app-design-system";
import { Platform, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { CircularProgress } from "../../../../../../components/ui/CircularProgress";
import { ReadStatus } from "../types/ReadStatus";

const pictogramMap: Record<ReadStatus, IOPictograms> = {
  idle: "smile",
  reading: Platform.select({ ios: "nfcScaniOS", default: "nfcScanAndroid" }),
  success: "success",
  error: "fatalError"
};

const statusColorMap: Record<ReadStatus, IOColors> = {
  idle: "blueIO-500",
  reading: "blueIO-500",
  success: "success-500",
  error: "error-500"
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
      strokeBgColor={IOColors["grey-100"]}
      strokeColor={IOColors[statusColorMap[status]]}
      strokeWidth={8}
    >
      <>
        <Animated.View layout={LinearTransition}>
          <Pictogram name={pictogramMap[status]} size={180} />
        </Animated.View>
        {status === "reading" && step && (
          <IOText color="black" font="FiraCode" size={12} weight="Bold">
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
