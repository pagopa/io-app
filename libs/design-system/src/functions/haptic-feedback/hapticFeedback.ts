import { Presets } from "react-native-pulsar";

/**
 * The cross-platform system haptics exposed by Pulsar.
 *
 * The `Android` namespace is deliberately excluded: it groups platform-specific
 * effects that have no iOS counterpart, so it must not leak into the shared API.
 */
type HapticType = Exclude<keyof typeof Presets.System, "Android">;

/**
 * Plays a system haptic feedback on the device.
 *
 * There is no per-call option: Pulsar detects the device haptic support level
 * and silently degrades on unsupported hardware.
 */
const triggerHaptic = (type: HapticType) => {
  Presets.System[type]();
};

export { triggerHaptic };
export type { HapticType };
