import {
  FeatureInfo,
  IOButton,
  IOMarkdownLite,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { useIOSelector } from "../../../../store/hooks";
import { sendVisitTheWebsiteUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { SendUserType } from "../../../pushNotifications/analytics";
import { trackSendAarNotificationClosureExit } from "../analytics";
import { SendAArFeedbackBanner } from "./SendAarFeedbackBanner";

export type SendAarMessageDetailBottomSheetProps = {
  onPrimaryActionPress: () => void;
  onSecondaryActionPress: () => void;
  sendUserType: SendUserType;
};

export const SendAarMessageDetailBottomSheet = ({
  onPrimaryActionPress,
  onSecondaryActionPress,
  sendUserType
}: SendAarMessageDetailBottomSheetProps) => {
  const isDelegate = sendUserType === "mandatory";
  const sendVisitTheWebsiteUrl = useIOSelector(sendVisitTheWebsiteUrlSelector);

  const onLinkPress = (url: string) => {
    trackSendAarNotificationClosureExit(sendUserType);
    openWebUrl(url);
  };

  return (
    <View>
      <FeatureInfo
        body={I18n.t("features.pn.aar.flow.closeNotification.paragraph1")}
        iconName="qrCode"
      />
      <VSpacer size={24} />
      <FeatureInfo
        body={I18n.t("features.pn.aar.flow.closeNotification.paragraph2")}
        iconName="navScan"
      />
      <VSpacer size={24} />

      {!isDelegate && (
        <>
          <FeatureInfo
            body={
              <IOMarkdownLite
                content={I18n.t(
                  "features.pn.aar.flow.closeNotification.paragraph3",
                  { url: sendVisitTheWebsiteUrl }
                )}
                onLinkPress={onLinkPress}
                small
              />
            }
            iconName="website"
          />
          <VSpacer size={24} />
        </>
      )}

      {isDelegate && <SendAArFeedbackBanner />}

      <IOButton
        label={I18n.t("features.pn.aar.flow.closeNotification.primaryAction")}
        onPress={onPrimaryActionPress}
        testID="primary_button"
      />
      <VSpacer size={16} />
      <View
        style={{
          alignSelf: "center"
        }}
      >
        <IOButton
          label={I18n.t(
            "features.pn.aar.flow.closeNotification.secondaryAction"
          )}
          onPress={onSecondaryActionPress}
          testID="secondary_button"
          variant="link"
        />
      </View>
      <VSpacer size={24} />
    </View>
  );
};
