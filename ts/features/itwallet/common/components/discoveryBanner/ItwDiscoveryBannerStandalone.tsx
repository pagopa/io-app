import React, { ReactElement } from "react";
import { useIOSelector } from "../../../../../store/hooks";
import { isItwDiscoveryBannerRenderableSelector } from "../../store/selectors";
import {
  ItwDiscoveryBanner,
  ItwDiscoveryBannerProps
} from "./ItwDiscoveryBanner";

type Props = Omit<ItwDiscoveryBannerProps, "handleOnClose"> & {
  fallbackComponent?: ReactElement;
};

/**
 * to use in flows where either
 * - we need a fallback component
 * - we do not want to handle the banner's visibility logic externally
 *   (see MultiBanner feature for the landing screen)
 */
export const ItwDiscoveryBannerStandalone = (props: Props) => {
  const [isVisible, setVisible] = React.useState(true);

  const isBannerRenderable = useIOSelector(
    isItwDiscoveryBannerRenderableSelector
  );

  const shouldBeHidden = React.useMemo(
    () =>
      // Banner should be hidden if:
      !isVisible || // The user closed it by pressing the `x` button
      !isBannerRenderable, // the various validity checks fail
    [isBannerRenderable, isVisible]
  );
  // end logic
  if (shouldBeHidden) {
    const { fallbackComponent } = props;
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return null;
  }

  return (
    <ItwDiscoveryBanner handleOnClose={() => setVisible(false)} {...props} />
  );
};
