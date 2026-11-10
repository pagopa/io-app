import { useCallback, useState } from "react";

import { FooterActionsInlineMeasurements } from "../FooterActionsInline";

type UseFooterActionsInlineMeasurementsProps = {
  footerActionsInlineMeasurements: FooterActionsInlineMeasurements;
  handleFooterActionsInlineMeasurements: (
    values: FooterActionsInlineMeasurements
  ) => void;
};
/**
 * Custom hook to handle the `FooterActions` measurements
 *
 * @returns An object with:
 *
 *   - `footerActionsInlineMeasurements`: object containing the
 *     `FooterActionsInline` measurements
 *   - `handleFooterActionsInlineMeasurements`: function to update the footer
 *     actions measurements (to be applied to `onMeasure` prop of
 *     `FooterActionsInline`)
 */
export const useFooterActionsInlineMeasurements =
  (): UseFooterActionsInlineMeasurementsProps => {
    const [
      footerActionsInlineMeasurements,
      setFooterActionsInlineMeasurements
    ] = useState<FooterActionsInlineMeasurements>({
      safeBottomAreaHeight: 0
    });

    const handleFooterActionsInlineMeasurements = useCallback(
      (values: FooterActionsInlineMeasurements) => {
        setFooterActionsInlineMeasurements(values);
      },
      []
    );

    return {
      footerActionsInlineMeasurements,
      handleFooterActionsInlineMeasurements
    };
  };
