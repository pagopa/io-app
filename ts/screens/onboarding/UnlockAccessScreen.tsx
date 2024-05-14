import React from "react";
import {
  Body,
  FeatureInfo,
  H6,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Text, View } from "react-native";
import I18n from "../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../utils/url";
import ROUTES from "../../navigation/routes";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { CustomWizardScreen } from "../../components/screens/CustomWizardScreen";
type Props = {
  identifier: "SPID" | "CIE";
};
const UnlockAccessScreen = (props: Props) => {
  const { identifier } = props;
  const navigation = useIONavigation();
  const ModalContent = () => (
    <View testID="modal-view-test">
      <Body weight="Regular" color="grey-700">
        {I18n.t("authentication.unlockmodal.description1_1")}
        {"\n"}
        {I18n.t("authentication.unlockmodal.description1_2")}{" "}
        <Text style={{ color: IOColors["grey-700"], fontWeight: "bold" }}>
          {I18n.t("authentication.unlockmodal.description1_3")}{" "}
        </Text>
        {I18n.t("authentication.unlockmodal.description1_4")}{" "}
      </Body>
      <VSpacer size={24} />
      <H6 weight="SemiBold">{I18n.t("authentication.unlockmodal.title2")}</H6>
      <VSpacer size={24} />
      <FeatureInfo
        iconName="security"
        body={I18n.t("authentication.unlockmodal.listitem1")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="login"
        body={I18n.t("authentication.unlockmodal.listitem2_1")}
        actionLabel={I18n.t("authentication.unlockmodal.listitem2_2")}
        actionOnPress={() => openWebUrl("https://ioapp.it/")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="locked"
        body={
          <Body weight="Regular" color="grey-700">
            {I18n.t("authentication.unlockmodal.listitem3_1")}{" "}
            <Text style={{ fontStyle: "italic" }}>
              {I18n.t("authentication.unlockmodal.listitem3_2")}{" "}
            </Text>
            {I18n.t("authentication.unlockmodal.listitem3_3")}{" "}
            <Text style={{ fontWeight: "bold" }}>
              {I18n.t("authentication.unlockmodal.listitem3_4")}{" "}
            </Text>
            {I18n.t("authentication.unlockmodal.listitem3_5")}
          </Body>
        }
      />
    </View>
  );

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("authentication.unlockmodal.title"),
      component: <ModalContent />,
      fullScreen: true
    },
    100
  );

  const onPressActionButton = () => {
    if (identifier === "SPID") {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_LANDING
      });
    } else {
      // TODO -> Need to navigate on messages home screen
    }
  };

  return (
    <>
      <CustomWizardScreen
        pictogram="accessDenied"
        title={I18n.t("authentication.unlock.title")}
        description={
          identifier === "SPID"
            ? I18n.t("authentication.unlock.subtitlel2")
            : I18n.t("authentication.unlock.subtitlel3")
        }
        buttonLink={{
          label: I18n.t("authentication.unlock.learnmore"),
          onPress: presentVeryLongAutoresizableBottomSheetWithFooter,
          testID: "learn-more-link-test"
        }}
        primaryButton={{
          testID: "button-solid-test",
          label: I18n.t("authentication.unlock.title"),
          onPress: () => openWebUrl("https://ioapp.it/")
        }}
        actionButton={{
          testID: "button-link-test",
          label:
            identifier === "SPID"
              ? I18n.t("global.buttons.close")
              : I18n.t("authentication.unlock.loginIO"),
          onPress: onPressActionButton
        }}
      />
      {veryLongAutoResizableBottomSheetWithFooter}
    </>
  );
};

export default UnlockAccessScreen;
