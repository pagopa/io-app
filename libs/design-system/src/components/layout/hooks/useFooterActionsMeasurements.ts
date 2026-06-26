import { useCallback, useState } from "react";
import { FooterActionsMeasurements } from "../FooterActions";

type UseFooterActionsMeasurementsProps = {
  footerActionsMeasurements: FooterActionsMeasurements;
  handleFooterActionsMeasurements: (values: FooterActionsMeasurements) => void;
};
/**
 * Custom hook to handle the `FooterActions` measurements
 * @returns
 *   - `footerActionsMeasurements`
 *      Object containing the `FooterActions` measurements
 *   - `handleFooterActionsMeasurements`
 *      Function to update the footer actions measurements
 *      (to be applied to `onMeasure` prop of `FooterActions`)
 */
export const useFooterActionsMeasurements =
  (): UseFooterActionsMeasurementsProps => {
    const [footerActionsMeasurements, setFooterActionsMeasurements] =
      useState<FooterActionsMeasurements>({
        actionBlockHeight: 0,
        safeBottomAreaHeight: 0
      });

    const handleFooterActionsMeasurements = useCallback(
      (values: FooterActionsMeasurements) => {
        setFooterActionsMeasurements(values);
      },
      []
    );

    return {
      footerActionsMeasurements,
      handleFooterActionsMeasurements
    };
  };
