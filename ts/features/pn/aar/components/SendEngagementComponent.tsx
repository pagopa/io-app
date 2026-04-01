import {
  FeatureInfo,
  H3,
  IOMarkdownLite,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";

export type SendEngagementComponentProps = {
  isLoading: boolean;
  onClose: () => void;
  onPrimaryAction: () => void;
};

export const SendEngagementComponent = ({
  isLoading,
  onClose,
  onPrimaryAction
}: SendEngagementComponentProps) => {
  const { privacy: privacyUrl, tos: tosUrl } = useIOSelector(
    pnPrivacyUrlsSelector
  );

  const openWebUrlIfNotLoading = (url: string) => {
    if (!isLoading) {
      openWebUrl(url);
    }
  };
  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("features.pn.aar.serviceActivation.primaryAction"),
          onPress: onPrimaryAction,
          loading: isLoading,
          testID: "primary-action"
        }
      }}
      headerConfig={{
        title: "",
        ignoreSafeAreaMargin: false,
        type: "singleAction",
        firstAction: {
          icon: "closeMedium",
          accessibilityLabel: I18n.t(
            "features.pn.aar.serviceActivation.headerAction"
          ),
          onPress: onClose,
          testID: "close-button"
        }
      }}
    >
      <H3 textStyle={{ textAlign: "center" }}>
        {I18n.t("features.pn.aar.serviceActivation.title")}
      </H3>
      <VSpacer size={24} />
      <FeatureInfo
        pictogramProps={{ name: "emailDotNotif", pictogramStyle: "default" }}
        body={
          <IOMarkdownLite
            content={I18n.t("features.pn.aar.serviceActivation.feature1")}
          />
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        pictogramProps={{ name: "savingMoney", pictogramStyle: "default" }}
        body={
          <IOMarkdownLite
            content={I18n.t("features.pn.aar.serviceActivation.feature2")}
          />
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        pictogramProps={{ name: "cardFavourite", pictogramStyle: "default" }}
        body={
          <IOMarkdownLite
            content={I18n.t("features.pn.aar.serviceActivation.feature3")}
          />
        }
      />
      <VSpacer size={32} />
      <IOMarkdownLite
        content={I18n.t("features.pn.aar.serviceActivation.footer", {
          privacyUrl,
          tosUrl
        })}
        onLinkPress={openWebUrlIfNotLoading}
      />
    </IOScrollView>
  );
};
