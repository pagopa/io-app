import {
  FeatureInfo,
  IOButton,
  IOMarkdownLite,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import { sendVisitTheWebsiteUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { trackSendAarNotificationClosureExit } from "../analytics";
import { SendUserType } from "../../../pushNotifications/analytics";

export type SendAARMessageDetailBottomSheetProps = {
  onPrimaryActionPress: () => void;
  onSecondaryActionPress: () => void;
  sendUserType: SendUserType;
};

export const SendAARMessageDetailBottomSheet = ({
  onPrimaryActionPress,
  onSecondaryActionPress,
  sendUserType
}: SendAARMessageDetailBottomSheetProps) => {
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
          variant="link"
          label={I18n.t(
            "features.pn.aar.flow.closeNotification.secondaryAction"
          )}
          onPress={onSecondaryActionPress}
          testID="secondary_button"
        />
      </View>
      <VSpacer size={24} />
    </View>
  );
};
