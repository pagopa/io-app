import { View } from "react-native";

import { useIOSelector } from "../../../../../store/hooks";
import { isDocSuIODiscoveryBannerRenderableSelector } from "../../store/selectors";
import { DocSuIODiscoveryBanner } from "./DocSuIODiscoveryBanner";

/**
 * To use in flows where we do not want to handle the banner's visibility logic
 * externally (see MultiBanner feature for the landing screen)
 */
export const DocSuIODiscoveryBannerStandalone = () => {
  const isBannerRenderable = useIOSelector(
    isDocSuIODiscoveryBannerRenderableSelector
  );

  if (!isBannerRenderable) {
    return null;
  }

  return (
    <View
      style={{ marginVertical: 8 }}
      testID="itwDiscoveryBannerStandaloneTestID"
    >
      <DocSuIODiscoveryBanner closable={false} ignoreMargins={true} />
    </View>
  );
};
