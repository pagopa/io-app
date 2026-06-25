import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import i18n from "i18next";

import { IOScrollViewCentredContent } from "../../../../components/ui/IOScrollViewCentredContent";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  trackFciNfcNotSupported,
  trackFciNfcNotSupportedClose
} from "../../analytics";
import { fciEndRequest } from "../../store/actions";

export const FciNfcNotAvailableScreen = () => {
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    trackFciNfcNotSupported();
  });

  const featureInfoText = i18n.t(
    "features.fci.requestL3.nfcNotAvailable.featureInfoText",
    { returnObjects: true }
  );

  return (
    <IOScrollViewCentredContent
      actions={{
        type: "SingleButton",
        primary: {
          testID: "help-center-cta",
          onPress: () => {
            trackFciNfcNotSupportedClose();
            dispatch(fciEndRequest());
          },
          label: i18n.t("features.fci.requestL3.nfcNotAvailable.cta")
        }
      }}
      alwaysBounceVertical={false}
      contentContainerStyle={{
        paddingHorizontal: 32
      }}
      description={i18n.t("features.fci.requestL3.nfcNotAvailable.description")}
      pictogram="updateOS"
      title={i18n.t("features.fci.requestL3.nfcNotAvailable.title")}
    >
      <VSpacer size={24} />
      <FeatureInfo body={featureInfoText[0]} iconName="contactless" />
      <VSpacer size={24} />
      <FeatureInfo body={featureInfoText[1]} iconName="history" />
    </IOScrollViewCentredContent>
  );
};
