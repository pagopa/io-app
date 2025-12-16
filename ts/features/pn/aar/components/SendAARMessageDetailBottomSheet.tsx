import {
  BodySmall,
  FeatureInfo,
  IOButton,
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

  const onLinkPress = () => {
    trackSendAarNotificationClosureExit(sendUserType);
    openWebUrl(sendVisitTheWebsiteUrl);
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

      {isDelegate ? (
        <></>
      ) : (
        <>
          <FeatureInfo
            body={
              <>
                <BodySmall testID={"body_nomandate"}>
                  {I18n.t("features.pn.aar.flow.closeNotification.paragraph3")}
                </BodySmall>
                <BodySmall
                  asLink
                  onPress={onLinkPress}
                  weight="Semibold"
                  testID="link"
                >
                  {I18n.t("features.pn.aar.flow.closeNotification.link")}
                </BodySmall>
              </>
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
