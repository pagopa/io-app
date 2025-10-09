import {
  Body,
  FeatureInfo,
  IOButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { isTestEnv } from "../../../../utils/environment";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

const URL = "https://cittadini.notifichedigitali.it/auth/login";

interface BottomSheetContentProps {
  onPrimaryActionPress: () => void;
  onSecondaryActionPress: () => void;
}

const BottomSheetContent = memo(
  ({
    onPrimaryActionPress,
    onSecondaryActionPress
  }: BottomSheetContentProps) => {
    const currentFlow = useIOSelector(currentAARFlowData);

    const mandateId = useMemo(
      () =>
        currentFlow.type === sendAARFlowStates.displayingNotificationData
          ? currentFlow.mandateId
          : undefined,
      [currentFlow]
    );

    const onLinkPress = () => {
      openWebUrl(URL);
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
              <Body>
                {I18n.t(
                  mandateId
                    ? "features.pn.aar.flow.closeNotification.paragraph3"
                    : "features.pn.aar.flow.closeNotification.paragraphDelegate3"
                )}
              </Body>
              <Body
                asLink
                onPress={onLinkPress}
                weight="Semibold"
                testID="link"
              >
                {I18n.t("features.pn.aar.flow.closeNotification.link")}
              </Body>
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
  }
);

export const useAARCloseBottomSheet = () => {
  const { popToTop } = useIONavigation();

  const onPrimaryActionPress = () => {
    bottomSheetModal.dismiss();
  };

  const onSecondaryActionPress = () => {
    bottomSheetModal.dismiss();
    popToTop();
  };

  const bottomSheetModal = useIOBottomSheetModal({
    title: I18n.t("features.pn.aar.flow.closeNotification.title"),
    component: (
      <BottomSheetContent
        onPrimaryActionPress={onPrimaryActionPress}
        onSecondaryActionPress={onSecondaryActionPress}
      />
    )
  });

  return bottomSheetModal;
};

export const testable = isTestEnv ? { BottomSheetContent } : undefined;
