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
      size={300}
      radius={150}
      progress={progress * 100}
      strokeColor={IOColors[statusColorMap[status]]}
      strokeBgColor={IOColors["grey-100"]}
      strokeWidth={8}
    >
      <>
        <Animated.View layout={LinearTransition}>
          <Pictogram size={180} name={pictogramMap[status]} />
        </Animated.View>
        {status === "reading" && step && (
          <IOText font="DMMono" color="black" weight="Bold" size={12}>
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
