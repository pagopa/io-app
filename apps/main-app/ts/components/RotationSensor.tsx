import { ReactNode } from "react";
import { SharedValue } from "react-native-reanimated";

import { useRotationSensor } from "../hooks/useRotationSensor";

type RenderRoll = (roll?: SharedValue<number>) => ReactNode;

type RotationSensorProps = {
  children: RenderRoll;
  enabled: boolean;
};

const SensorRoll = ({ render }: { render: RenderRoll }) =>
  render(useRotationSensor());

/**
 * Provides the relative device roll to `children` only while `enabled`.
 * Reanimated has no API to pause a sensor, so the sensor is unregistered by
 * unmounting it; when disabled, `children` receive no roll and render at rest.
 */
export const RotationSensor = ({ enabled, children }: RotationSensorProps) =>
  enabled ? <SensorRoll render={children} /> : children();
