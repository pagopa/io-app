import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { IOScrollViewCentredContent } from "../../../../components/ui/IOScrollViewCentredContent";
import { useIODispatch } from "../../../../store/hooks";
import { fciEndRequest } from "../../store/actions";

export const FciNfcNotAvailableScreen = () => {
  const dispatch = useIODispatch();

  const featureInfoText = i18n.t(
    "features.fci.requestL3.nfcNotAvailable.featureInfoText",
    { returnObjects: true }
  );

  return (
    <IOScrollViewCentredContent
      pictogram="updateOS"
      title={i18n.t("features.fci.requestL3.nfcNotAvailable.title")}
      description={i18n.t("features.fci.requestL3.nfcNotAvailable.description")}
      actions={{
        type: "SingleButton",
        primary: {
          testID: "help-center-cta",
          onPress: () => dispatch(fciEndRequest()),
          label: i18n.t("features.fci.requestL3.nfcNotAvailable.cta")
        }
      }}
      alwaysBounceVertical={false}
      headerConfig={{
        title: "",
        type: "singleAction",
        firstAction: {
          icon: "closeLarge",
          onPress: () => {
            dispatch(fciEndRequest());
          },
          accessibilityLabel: i18n.t(
            "global.accessibility.contextualHelp.close"
          ),
          testID: "close-x"
        }
      }}
      contentContainerStyle={{
        paddingHorizontal: 32
      }}
    >
      <VSpacer size={24} />
      <FeatureInfo iconName="contactless" body={featureInfoText[0]} />
      <VSpacer size={24} />
      <FeatureInfo iconName="history" body={featureInfoText[1]} />
    </IOScrollViewCentredContent>
  );
};
