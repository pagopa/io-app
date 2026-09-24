import { View } from "react-native";

import { useIOSelector } from "../../../../../store/hooks";
import { isItwDiscoveryBannerRenderableSelector } from "../../store/selectors";
import { ItwDiscoveryBannerLegacy } from "./ItwDiscoveryBanner";

/**
 * To use in flows where we do not want to handle the banner's visibility logic
 * externally (see MultiBanner feature for the landing screen)
 */
export const ItwDiscoveryBannerStandalone = () => {
  const isBannerRenderable = useIOSelector(
    isItwDiscoveryBannerRenderableSelector
  );

  if (!isBannerRenderable) {
    return null;
  }

  return (
    <View
      style={{ marginVertical: 8 }}
      testID="itwDiscoveryBannerStandaloneTestID"
    >
      <ItwDiscoveryBannerLegacy closable={false} ignoreMargins={true} />
    </View>
  );
};
