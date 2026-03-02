import { useEffect } from "react";
import { TourItemMeasurement } from "../types";
import { useTourContext } from "./TourProvider";

type UseGuidedTourRegionConfig = {
  groupId: string;
  index: number;
  title: string;
  description: string;
  region: () => TourItemMeasurement | undefined;
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
  region
}: UseGuidedTourRegionConfig) => {
  const { registerRegion, unregisterRegion } = useTourContext();

  useEffect(() => {
    registerRegion(groupId, index, region, { title, description });

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
    region
  ]);
};
