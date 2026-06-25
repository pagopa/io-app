import {
  FeatureInfo,
  IOMarkdownLite,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIOSelector } from "../../../../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { IO_SUPPLIERS_URL_BODY } from "../../../../../../urls";
import { setAccessibilityFocus } from "../../../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../../utils/url";
import { TrackingInfo } from "../../../../common/analytics/mixpanel/mixpanelAnalytics";

export type FeatureProps = {
  trackAction: (info: TrackingInfo) => void;
};

const shareDataSecurityMoreLink =
  "https://www.pagopa.it/it/politiche-sulla-sicurezza-delle-informazioni-e-sulla-qualita/";

const MarkdownBody = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      // Necessary because `IOMarkdown` does not handle accessibility properly at the moment
      accessibilityLabel={
        I18n.t("profile.main.privacy.shareData.whyBottomSheet.body").replace(
          /\*/g,
          ""
        ) // It removes all '*' characters associated with Markdown syntax.
      }
      accessible
    >
      <VSpacer size={16} />
      <View
        accessibilityElementsHidden
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <IOMarkdownLite
          content={I18n.t("profile.main.privacy.shareData.whyBottomSheet.body")}
        />
      </View>
      <VSpacer size={8} />
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
};

const AnalyticsFeatureInfo = ({ trackAction }: FeatureProps) => {
  const bodyRef = useRef<View>(null);
  const { present, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t("profile.main.privacy.shareData.whyBottomSheet.title"),
    component: <MarkdownBody />,
    onDismiss: () => {
      // When the bottom sheet is dismissed, the accessibility focus shifts to the body component of `FeatureInfo`.
      // This workaround is implemented to maintain semantic order and prevent disruptions.
      // Ideally, the accessibility focus should return to the element that triggered the bottom sheet's display. However, implementing this solution currently isn't feasible.
      setAccessibilityFocus(bodyRef, 300 as Millisecond);
    }
  });

  const analyticsBody = useMemo(
    () => (
      <View ref={bodyRef}>
        <IOMarkdownLite
          content={I18n.t(
            "profile.main.privacy.shareData.screen.why.description"
          )}
        />
      </View>
    ),
    []
  );

  const handleOnPress = useCallback(() => {
    trackAction(TrackingInfo.WHY);
    present();
  }, [trackAction, present]);

  return (
    <>
      <FeatureInfo
        action={{
          label: I18n.t("profile.main.privacy.shareData.screen.why.cta"),
          onPress: handleOnPress
        }}
        body={analyticsBody}
        iconName="analytics"
      />
      {bottomSheet}
    </>
  );
};

const SecurityFeatureInfo = ({ trackAction }: FeatureProps) => {
  const handleOnPress = () => {
    trackAction(TrackingInfo.FIND_OUT_MORE);
    openWebUrl(shareDataSecurityMoreLink);
  };

  return (
    <FeatureInfo
      action={{
        label: I18n.t("profile.main.privacy.shareData.screen.security.cta"),
        onPress: handleOnPress
      }}
      body={
        <IOMarkdownLite
          content={I18n.t(
            "profile.main.privacy.shareData.screen.security.description"
          )}
        />
      }
      iconName="locked"
    />
  );
};

const GDPRFeatureInfo = ({ trackAction }: FeatureProps) => {
  const ioSuppliersUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", IO_SUPPLIERS_URL_BODY)
  );
  const handleOnPress = () => {
    trackAction(TrackingInfo.SUPPLIERS);
    openWebUrl(ioSuppliersUrl);
  };

  return (
    <FeatureInfo
      action={{
        label: I18n.t("profile.main.privacy.shareData.screen.gdpr.cta"),
        onPress: handleOnPress
      }}
      body={
        <IOMarkdownLite
          content={I18n.t(
            "profile.main.privacy.shareData.screen.gdpr.description"
          )}
        />
      }
      iconName="security"
    />
  );
};

export { AnalyticsFeatureInfo, GDPRFeatureInfo, SecurityFeatureInfo };
