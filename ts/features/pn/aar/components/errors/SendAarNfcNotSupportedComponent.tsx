import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useEffect } from "react";
import { IOScrollViewCentredContent } from "../../../../../components/ui/IOScrollViewCentredContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAarNfcNotSupportedComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const { setOptions } = useIONavigation();

  useEffect(() => {
    setOptions({ headerShown: true });
  }, [setOptions]);

  const featureInfoText = i18n.t(
    "features.pn.aar.flow.delegated.nfcNotSupported.featureInfoText",
    { returnObjects: true }
  );

  return (
    <IOScrollViewCentredContent
      pictogram="updateOS"
      title={i18n.t("features.pn.aar.flow.delegated.nfcNotSupported.title")}
      description={i18n.t(
        "features.pn.aar.flow.delegated.nfcNotSupported.body"
      )}
      actions={{
        type: "SingleButton",
        primary: {
          icon: "instruction",
          onPress: () => undefined,
          label: i18n.t("features.pn.aar.flow.delegated.nfcNotSupported.cta")
        }
      }}
      alwaysBounceVertical={false}
      headerConfig={{
        title: "",
        type: "singleAction",
        firstAction: {
          icon: "closeLarge",
          onPress: terminateFlow,
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
