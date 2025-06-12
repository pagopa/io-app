import {
  IOPictograms,
  IOPictogramSizeScale,
  Pictogram
} from "@pagopa/io-app-design-system";
import LottieView, { LottieViewProps } from "lottie-react-native";
import { useReducedMotion } from "react-native-reanimated";

/* Animated Pictograms */
import empty from "../../../assets/animated-pictograms/Empty.json";
import error from "../../../assets/animated-pictograms/Error.json";
import fatalError from "../../../assets/animated-pictograms/FatalError.json";
import lock from "../../../assets/animated-pictograms/Lock.json";
import scanCardAndroid from "../../../assets/animated-pictograms/ScanCardAndroid.json";
import scanCardiOS from "../../../assets/animated-pictograms/ScanCardiOS.json";
import search from "../../../assets/animated-pictograms/Search.json";
import success from "../../../assets/animated-pictograms/Success.json";
import umbrella from "../../../assets/animated-pictograms/Umbrella.json";
import waiting from "../../../assets/animated-pictograms/Waiting.json";
import warning from "../../../assets/animated-pictograms/Warning.json";
import welcome from "../../../assets/animated-pictograms/Welcome.json";

export const IOAnimatedPictogramsAssets = {
  waiting,
  empty,
  error,
  fatalError,
  lock,
  scanCardAndroid,
  scanCardiOS,
  search,
  success,
  umbrella,
  warning,
  welcome
} as const;

export type IOAnimatedPictograms = keyof typeof IOAnimatedPictogramsAssets;

export type AnimatedPictogram = {
  name: IOAnimatedPictograms;
  size: IOPictogramSizeScale;
  loop: LottieViewProps["loop"];
};

const staticPictogramsMap: Record<IOAnimatedPictograms, IOPictograms> = {
  welcome: "hello",
  empty: "empty",
  scanCardiOS: "nfcScaniOS",
  scanCardAndroid: "nfcScanAndroid",
  umbrella: "umbrella",
  error: "accessDenied",
  fatalError: "fatalError",
  lock: "passcode",
  search: "searchLens",
  success: "success",
  warning: "attention",
  waiting: "ended"
};

/* Compared to the static pictograms, the animated pictograms
  seems slightly smaller, so we need to scale them a little to
  uniform the perceived size */
const sizeMultiplier = 1.25;

export const AnimatedPictogram = ({
  name,
  size,
  loop = true
}: AnimatedPictogram) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <Pictogram name={staticPictogramsMap[name]} size={size} />;
  }

  return (
    <LottieView
      autoPlay={true}
      loop={loop}
      style={{
        width: size * sizeMultiplier,
        height: size * sizeMultiplier
      }}
      source={IOAnimatedPictogramsAssets[name]}
    />
  );
};
