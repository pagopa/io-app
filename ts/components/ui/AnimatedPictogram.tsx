import {
  IOPictograms,
  IOPictogramSizeScale,
  Pictogram,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  Group,
  Skia,
  Skottie,
  useClock
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  useDerivedValue,
  useReducedMotion,
  useSharedValue
} from "react-native-reanimated";

/* Animated Pictograms */
import empty from "../../../assets/animated-pictograms/Empty.json";
import emptyDark from "../../../assets/animated-pictograms/EmptyDark.json";
import accessDenied from "../../../assets/animated-pictograms/AccessDenied.json";
import accessDeniedDark from "../../../assets/animated-pictograms/AccessDeniedDark.json";
import fatalError from "../../../assets/animated-pictograms/FatalError.json";
import fatalErrorDark from "../../../assets/animated-pictograms/FatalErrorDark.json";
import lock from "../../../assets/animated-pictograms/Lock.json";
import lockDark from "../../../assets/animated-pictograms/LockDark.json";
import scanCardAndroid from "../../../assets/animated-pictograms/ScanCardAndroid.json";
import scanCardAndroidDark from "../../../assets/animated-pictograms/ScanCardAndroidDark.json";
import scanCardiOS from "../../../assets/animated-pictograms/ScanCardiOS.json";
import scanCardiOSDark from "../../../assets/animated-pictograms/ScanCardiOSDark.json";
import searchLens from "../../../assets/animated-pictograms/SearchLens.json";
import searchLensDark from "../../../assets/animated-pictograms/SearchLensDark.json";
import success from "../../../assets/animated-pictograms/Success.json";
import successDark from "../../../assets/animated-pictograms/SuccessDark.json";
import umbrella from "../../../assets/animated-pictograms/Umbrella.json";
import umbrellaDark from "../../../assets/animated-pictograms/UmbrellaDark.json";
import waiting from "../../../assets/animated-pictograms/Waiting.json";
import waitingDark from "../../../assets/animated-pictograms/WaitingDark.json";
import attention from "../../../assets/animated-pictograms/Attention.json";
import attentionDark from "../../../assets/animated-pictograms/AttentionDark.json";
import welcome from "../../../assets/animated-pictograms/Welcome.json";
import welcomeDark from "../../../assets/animated-pictograms/WelcomeDark.json";

export const IOAnimatedPictogramsAssets = {
  waiting,
  empty,
  accessDenied,
  fatalError,
  lock,
  scanCardAndroid,
  scanCardiOS,
  searchLens,
  success,
  umbrella,
  attention,
  welcome
} as const;

export const IOAnimatedPictogramsAssetsDark: Record<
  IOAnimatedPictograms,
  unknown
> = {
  waiting: waitingDark,
  empty: emptyDark,
  accessDenied: accessDeniedDark,
  fatalError: fatalErrorDark,
  lock: lockDark,
  scanCardAndroid: scanCardAndroidDark,
  scanCardiOS: scanCardiOSDark,
  searchLens: searchLensDark,
  success: successDark,
  attention: attentionDark,
  umbrella: umbrellaDark,
  welcome: welcomeDark
} as const;

export type IOAnimatedPictograms = keyof typeof IOAnimatedPictogramsAssets;

export type AnimatedPictogram = {
  name: IOAnimatedPictograms;
  size: IOPictogramSizeScale;
  loop?: boolean;
};

const pictogramsMap: Record<
  IOAnimatedPictograms,
  { static: IOPictograms; loop: boolean }
> = {
  welcome: { static: "hello", loop: false },
  empty: { static: "empty", loop: false },
  scanCardiOS: { static: "nfcScaniOS", loop: true },
  scanCardAndroid: { static: "nfcScanAndroid", loop: true },
  umbrella: { static: "umbrella", loop: true },
  accessDenied: { static: "accessDenied", loop: false },
  fatalError: { static: "fatalError", loop: false },
  lock: { static: "passcode", loop: true },
  searchLens: { static: "searchLens", loop: true },
  success: { static: "success", loop: false },
  attention: { static: "attention", loop: false },
  waiting: { static: "ended", loop: true }
};

/* Compared to the static pictograms, the animated pictograms
  seems slightly smaller, so we need to scale them a little to
  uniform the perceived size */
const sizeMultiplier = 1.2;

export const AnimatedPictogram = ({ name, size, loop }: AnimatedPictogram) => {
  const reduceMotion = useReducedMotion();
  const { themeType } = useIOThemeContext();
  const isDarkMode = themeType === "dark";

  const loopState = loop ?? pictogramsMap[name].loop;

  /* Ideally, I would have preferred an implementation using
  dynamic colour overrides from a single JSON Lottie file
  (or even better, Rive), but the original files don't reliably
  expose these colours, so we have to proceed with a more
  resource-intensive approach. */
  const themeDependentAsset = useMemo(
    () =>
      isDarkMode
        ? IOAnimatedPictogramsAssetsDark[name]
        : IOAnimatedPictogramsAssets[name],
    [name, isDarkMode]
  );

  const animation = Skia.Skottie.Make(JSON.stringify(themeDependentAsset));

  const originalSizeAsset = IOAnimatedPictogramsAssets[name].w ?? size;

  // See https://shopify.github.io/react-native-skia/docs/skottie
  // for reference
  const animationStartTime = useSharedValue(0);
  const clock = useClock();

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    animationStartTime.value = clock.value;
  }, [name, animationStartTime, clock]);

  const frame = useDerivedValue(() => {
    if (!animation) {
      return 0;
    }
    const fps = animation.fps();
    const duration = animation.duration();
    const totalFrames = duration * fps;

    const elapsedTime = (clock.value - animationStartTime.value) / 1000;
    const currentFrame = elapsedTime * fps;

    return loopState
      ? currentFrame % totalFrames
      : Math.min(currentFrame, totalFrames - 1);
  });

  if (reduceMotion || !animation) {
    return <Pictogram name={pictogramsMap[name].static} size={size} />;
  }

  return (
    <Canvas
      style={{
        width: size,
        height: size,
        transform: [{ scale: sizeMultiplier }]
      }}
    >
      <Group transform={[{ scale: size / originalSizeAsset }]}>
        <Skottie animation={animation} frame={frame} />
      </Group>
    </Canvas>
  );
};
