import { FeatureInfo, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect } from "react";

import { IOScrollViewCentredContent } from "../../../../../components/ui/IOScrollViewCentredContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { sendAarInAppDelegationUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackSendAarNotificationOpeningNfcNotSupported,
  trackSendAarNotificationOpeningNfcNotSupportedClosure,
  trackSendAarNotificationOpeningNfcNotSupportedInfo
} from "../../analytics";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAarNfcNotSupportedComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const { setOptions } = useIONavigation();
  const helpCenterUrl = useIOSelector(sendAarInAppDelegationUrlSelector);

  useEffect(() => {
    setOptions({ headerShown: true });
  }, [setOptions]);

  useEffect(() => {
    trackSendAarNotificationOpeningNfcNotSupported();
  }, []);

  const featureInfoText = I18n.t(
    "features.pn.aar.flow.delegated.nfcNotSupported.featureInfoText",
    { returnObjects: true }
  );

  return (
    <IOScrollViewCentredContent
      actions={{
        type: "SingleButton",
        primary: {
          icon: "instruction",
          testID: "help-center-cta",
          onPress: () => {
            trackSendAarNotificationOpeningNfcNotSupportedInfo();
            openWebUrl(helpCenterUrl);
          },
          label: I18n.t("features.pn.aar.flow.delegated.nfcNotSupported.cta")
        }
      }}
      contentContainerStyle={{
        paddingHorizontal: 32
      }}
      description={I18n.t(
        "features.pn.aar.flow.delegated.nfcNotSupported.body"
      )}
      headerConfig={{
        title: "",
        type: "singleAction",
        firstAction: {
          icon: "closeLarge",
          onPress: () => {
            trackSendAarNotificationOpeningNfcNotSupportedClosure();
            terminateFlow();
          },
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.close"
          ),
          testID: "close-x"
        }
      }}
      pictogram="updateOS"
      title={I18n.t("features.pn.aar.flow.delegated.nfcNotSupported.title")}
    >
      <VSpacer size={24} />
      <FeatureInfo body={featureInfoText[0]} iconName="contactless" />
      <VSpacer size={24} />
      <FeatureInfo body={featureInfoText[1]} iconName="history" />
    </IOScrollViewCentredContent>
  );
};
