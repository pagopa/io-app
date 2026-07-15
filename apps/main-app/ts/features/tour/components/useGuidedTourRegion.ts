import { useEffect } from "react";

import { TourCutoutStyle, TourItemMeasurement } from "../types";
import { useTourContext } from "./TourProvider";

type UseGuidedTourRegionConfig = {
  cutoutStyle?: TourCutoutStyle;
  description: string;
  groupId: string;
  index: number;
  region: () => TourItemMeasurement | undefined;
  title: string;
};

/**
 * Registers a tour step backed by a **region provider** instead of
 * wrapping a React element.  Use this for elements you cannot (or
 * do not want to) wrap — e.g. the react-navigation header, the
 * tab bar, or any native-managed view whose position you can
 * compute from layout constants.
 *
 * The `region` callback is invoked every time the overlay needs to
 * measure the step, so it can return up-to-date values based on
 * `useHeaderHeight()`, safe-area insets, screen dimensions, etc.
 */
export const useGuidedTourRegion = ({
  groupId,
  index,
  title,
  description,
  region,
  cutoutStyle
}: UseGuidedTourRegionConfig) => {
  const { registerRegion, unregisterRegion } = useTourContext();

  useEffect(() => {
    registerRegion(groupId, index, region, {
      title,
      description,
      cutoutStyle
    });

    return () => {
      unregisterRegion(groupId, index);
    };
  }, [
    registerRegion,
    unregisterRegion,
    groupId,
    index,
    title,
    description,
    region,
    cutoutStyle
  ]);
};
