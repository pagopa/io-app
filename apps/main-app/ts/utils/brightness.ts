import * as ScreenBrightness from "expo-brightness";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

// The maximum brightness
const HIGH_BRIGHTNESS = 1;

// This duration is chosen to be long enough to be noticeable but short enough to not be annoying
const DEFAULT_TRANSITION_DURATION = 1500;

type UseMaxBrightnessOptions = {
  /** The duration of the smooth transition */
  transitionDuration?: number;
  /** Whether to use a smooth transition to the maximum brightness */
  useSmoothTransition?: boolean;
};

/**
 * Custom hook that manages screen brightness levels for the application.
 *
 * Provides automatic brightness management with the following features: -
 * Automatically sets screen brightness to maximum when the component mounts and
 * app is active - Restores the original brightness level when component
 * unmounts or app becomes inactive - Handles platform-specific brightness APIs
 * for both iOS and Android - Optionally provides smooth brightness transitions
 * with configurable duration - Preserves Android's auto-brightness mode when
 * restoring original settings
 *
 * @example
 *   ```tsx
 *   // Basic usage
 *   useMaxBrightness();
 *
 *   // With smooth transition
 *   useMaxBrightness({
 *     useSmoothTransition: true,
 *     transitionDuration: 2000
 *   });
 *   ```;
 *
 * @see {@link UseMaxBrightnessOptions} for configuration options
 */
export function useMaxBrightness({
  useSmoothTransition = false,
  transitionDuration = DEFAULT_TRANSITION_DURATION
}: UseMaxBrightnessOptions = {}) {
  const currentAppState = useRef<AppStateStatus | null>(null);
  // Store the initial brightness
  const initialBrightness = useRef<null | number>(null);

  /**
   * Restores the screen brightness to its original value before any
   * modifications.
   *
   * On iOS: Restores the system-wide brightness level to the initial value.
   *
   * On Android: Checks if auto brightness mode was previously enabled. If it
   * was, restores auto brightness mode by setting app brightness to -1.
   * Otherwise, restores the specific brightness value that was saved.
   *
   * @returns Promise<void> Resolves when brightness is restored
   */
  const restoreInitialBrightness = useCallback(async () => {
    if (initialBrightness.current === null) {
      return;
    }
    const brightness = initialBrightness.current;
    await Platform.select({
      android: async () =>
        await ScreenBrightness.restoreSystemBrightnessAsync(),
      default: async () => await ScreenBrightness.setBrightnessAsync(brightness)
    })();
  }, []);

  /**
   * Set the brightness level between 0 and 1. On iOS, this sets the system-wide
   * screen brightness. On Android, this sets the app-specific brightness since
   * modifying system brightness requires additional permissions. The app
   * brightness only affects the current application window.
   *
   * @param brightness - Number between 0 (darkest) and 1 (brightest)
   * @returns Promise that resolves when brightness is set
   */
  const setBrightness = useCallback(
    async (brightness: number) =>
      await ScreenBrightness.setBrightnessAsync(brightness),
    []
  );

  /**
   * Set the brightness with a smooth transition by animating between the
   * initial and target brightness values. Uses linear interpolation to
   * gradually change brightness over the specified duration.
   *
   * @param brightness - Target brightness value between 0 (darkest) and 1
   *   (brightest)
   * @param duration - Duration of the transition animation in milliseconds
   * @returns Promise that resolves when the transition is complete
   */
  const setSmoothBrightness = useCallback(
    async (brightness: number, duration: number) => {
      const startBrightness = initialBrightness.current ?? 0;
      const startTime = Date.now();
      const diff = brightness - startBrightness;

      // Animate brightness change over duration
      const animate = async () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Calculate current brightness using linear interpolation
        const currentBrightness = startBrightness + diff * progress;
        await setBrightness(currentBrightness);

        if (progress < 1) {
          // Continue animation
          requestAnimationFrame(() => void animate());
        }
      };

      await animate();
    },
    [setBrightness]
  );

  /**
   * Sets the screen brightness to the maximum level (HIGH_BRIGHTNESS).
   *
   * If `useSmoothTransition` is enabled, the brightness change will be animated
   * over the specified `transitionDuration`. Otherwise, it will change
   * instantly.
   */
  const setMaxBrightness = useCallback(
    async () =>
      await (useSmoothTransition
        ? setSmoothBrightness(HIGH_BRIGHTNESS, transitionDuration)
        : setBrightness(HIGH_BRIGHTNESS)),
    [
      setSmoothBrightness,
      setBrightness,
      useSmoothTransition,
      transitionDuration
    ]
  );

  /**
   * Manages screen brightness based on app state changes.
   *
   * When the app becomes active: - Sets screen brightness to maximum level
   * using setMaxBrightness()
   *
   * When the app becomes inactive: - Restores the original brightness level
   * that was saved when the hook initialized - Only restores if
   * initialBrightness was successfully captured
   *
   * The effect also handles cleanup by: - Restoring original brightness on
   * unmount - Removing the AppState event listener
   */
  useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let appStateSubscription: any;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && currentAppState.current === "inactive") {
        // If the app is becoming active and was previously inactive, set the max brightness
        await setMaxBrightness();
      } else if (nextAppState !== "active") {
        // If the app is becoming inactive, restore the initial brightness
        // The app always becomes inactive before becoming background
        await restoreInitialBrightness();
      }
      currentAppState.current = nextAppState;
    };

    const initialize = async () => {
      try {
        // Store initial brightness
        initialBrightness.current = await ScreenBrightness.getBrightnessAsync();
        // Set to max brightness
        await setMaxBrightness();
        // Listen for app state changes
        appStateSubscription = AppState.addEventListener(
          "change",
          nextAppState => void handleAppStateChange(nextAppState)
        );
      } catch {
        // Ignore
      }
    };

    void initialize();

    return () => {
      void restoreInitialBrightness();
      appStateSubscription?.remove();
    };
  }, [restoreInitialBrightness, setMaxBrightness]);
}

/**
 * Convenience component that applies maximum brightness behavior when rendered.
 *
 * This component uses the `useMaxBrightness` hook internally to manage screen
 * brightness. When this component is mounted, it sets the screen brightness to
 * maximum. When unmounted, it restores the original brightness level.
 *
 * It accepts the same configuration options as `useMaxBrightness` via props.
 *
 * @example
 *   ```tsx
 *   // Basic usage
 *   <MaxBrightness />
 *   // With smooth transition
 *   <MaxBrightness useSmoothTransition={true} transitionDuration={2000} />
 *   ```;
 *
 * @param props - Configuration options for brightness management
 * @returns React.ReactNode that applies max brightness behavior when rendered
 */
export const MaxBrightness = (
  props: UseMaxBrightnessOptions = {}
): React.ReactNode => {
  useMaxBrightness(props);
  return null;
};
