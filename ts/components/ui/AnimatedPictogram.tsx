import LottieView, { LottieViewProps } from "lottie-react-native";
import { IOPictogramSizeScale } from "@pagopa/io-app-design-system";

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

export const AnimatedPictogram = ({
  name,
  size,
  loop = true
}: AnimatedPictogram) => (
  <LottieView
    autoPlay={true}
    loop={loop}
    style={{
      width: size,
      height: size
    }}
    source={IOAnimatedPictogramsAssets[name]}
  />
);
