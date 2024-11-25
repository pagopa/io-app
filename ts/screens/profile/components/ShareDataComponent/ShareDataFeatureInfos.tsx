import {
  Body,
  FeatureInfo,
  Label,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React, { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { ioSuppliersUrl } from "../../../../urls";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { TrackingInfo } from "../../analytics/mixpanel/mixpanelAnalytics";

export type FeatureProps = {
  trackAction: (info: TrackingInfo) => void;
};

const shareDataSecurityMoreLink =
  "https://www.pagopa.it/it/politiche-sulla-sicurezza-delle-informazioni-e-sulla-qualita/";

const MarkdownBody = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      accessible
      // Necessary because `LegacyMarkdown` component truncates the content into separate blocks.
      accessibilityLabel={
        I18n.t("profile.main.privacy.shareData.whyBottomSheet.body").replace(
          /\*/g,
          ""
        ) // It removes all '*' characters associated with Markdown syntax.
      }
    >
      <VSpacer size={16} />
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <LegacyMarkdown>
          {I18n.t("profile.main.privacy.shareData.whyBottomSheet.body")}
        </LegacyMarkdown>
      </View>
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
};

const AnalyticsFeatureInfo = ({ trackAction }: FeatureProps) => {
  const bodyRef = useRef<View>(null);
  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal({
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
      <Body ref={bodyRef}>
        {I18n.t("profile.main.privacy.shareData.screen.why.description.one")}
        <Label weight="Semibold">
          {I18n.t("profile.main.privacy.shareData.screen.why.description.two")}
        </Label>
        {`${I18n.t(
          "profile.main.privacy.shareData.screen.why.description.three"
        )}`}
      </Body>
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
        iconName="analytics"
        body={analyticsBody}
        action={{
          label: I18n.t("profile.main.privacy.shareData.screen.why.cta"),
          onPress: handleOnPress
        }}
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
      iconName="locked"
      body={
        <Body>
          {I18n.t(
            "profile.main.privacy.shareData.screen.security.description.one"
          )}
          <Label weight="Semibold">
            {I18n.t(
              "profile.main.privacy.shareData.screen.security.description.two"
            )}
          </Label>
          {I18n.t(
            "profile.main.privacy.shareData.screen.security.description.three"
          )}
        </Body>
      }
      action={{
        label: I18n.t("profile.main.privacy.shareData.screen.security.cta"),
        onPress: handleOnPress
      }}
    />
  );
};

const GDPRFeatureInfo = ({ trackAction }: FeatureProps) => {
  const handleOnPress = () => {
    trackAction(TrackingInfo.SUPPLIERS);
    openWebUrl(ioSuppliersUrl);
  };

  return (
    <FeatureInfo
      iconName="security"
      body={
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.gdpr.description.one")}
          <Label weight="Semibold">
            {I18n.t(
              "profile.main.privacy.shareData.screen.gdpr.description.two"
            )}
          </Label>
        </Body>
      }
      action={{
        label: I18n.t("profile.main.privacy.shareData.screen.gdpr.cta"),
        onPress: handleOnPress
      }}
    />
  );
};

export { AnalyticsFeatureInfo, GDPRFeatureInfo, SecurityFeatureInfo };
