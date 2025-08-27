import { Body, FeatureInfo, H3, VSpacer } from "@pagopa/io-app-design-system";
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
          <Body>
            <Body>
              {I18n.t("features.pn.aar.serviceActivation.feature1.part1")}
            </Body>
            <Body weight="Semibold">
              {I18n.t("features.pn.aar.serviceActivation.feature1.part2")}
            </Body>
            <Body>
              {I18n.t("features.pn.aar.serviceActivation.feature1.part3")}
            </Body>
          </Body>
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        pictogramProps={{ name: "savingMoney", pictogramStyle: "default" }}
        body={
          <Body>
            <Body>
              {I18n.t("features.pn.aar.serviceActivation.feature2.part1")}
            </Body>
            <Body weight="Semibold">
              {I18n.t("features.pn.aar.serviceActivation.feature2.part2")}
            </Body>
          </Body>
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        pictogramProps={{ name: "cardFavourite", pictogramStyle: "default" }}
        body={
          <Body>
            <Body>
              {I18n.t("features.pn.aar.serviceActivation.feature3.part1")}
            </Body>
            <Body weight="Semibold">
              {I18n.t("features.pn.aar.serviceActivation.feature3.part2")}
            </Body>
          </Body>
        }
      />
      <VSpacer size={32} />
      <Body>
        <Body>{I18n.t("features.pn.aar.serviceActivation.footer.part1")}</Body>
        <Body weight="Semibold">
          {I18n.t("features.pn.aar.serviceActivation.footer.part2")}
        </Body>
        <Body>{I18n.t("features.pn.aar.serviceActivation.footer.part3")}</Body>
        <Body
          asLink
          weight="Semibold"
          onPress={() => openWebUrlIfNotLoading(privacyUrl)}
          testID="privacy-link"
        >
          {I18n.t("features.pn.aar.serviceActivation.footer.part4")}
        </Body>
        <Body>{I18n.t("features.pn.aar.serviceActivation.footer.part5")}</Body>
        <Body
          asLink
          weight="Semibold"
          onPress={() => openWebUrlIfNotLoading(tosUrl)}
          testID="tos-link"
        >
          {I18n.t("features.pn.aar.serviceActivation.footer.part6")}
        </Body>
        <Body>{I18n.t("features.pn.aar.serviceActivation.footer.part7")}</Body>
      </Body>
    </IOScrollView>
  );
};
