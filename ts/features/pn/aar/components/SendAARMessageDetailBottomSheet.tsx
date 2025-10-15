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
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export type SendAARMessageDetailBottomSheetProps = {
  onPrimaryActionPress: () => void;
  onSecondaryActionPress: () => void;
};

export const SendAARMessageDetailBottomSheet = ({
  onPrimaryActionPress,
  onSecondaryActionPress
}: SendAARMessageDetailBottomSheetProps) => {
  const currentFlow = useIOSelector(currentAARFlowData);
  const sendVisitTheWebsiteUrl = useIOSelector(sendVisitTheWebsiteUrlSelector);

  const mandateId =
    currentFlow.type === sendAARFlowStates.displayingNotificationData
      ? currentFlow.mandateId
      : undefined;

  const onLinkPress = () => {
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
      <FeatureInfo
        body={
          <>
            <BodySmall testID={mandateId ? "body_mandate" : "body_nomandate"}>
              {I18n.t(
                mandateId
                  ? "features.pn.aar.flow.closeNotification.paragraph3"
                  : "features.pn.aar.flow.closeNotification.paragraphDelegate3"
              )}
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
