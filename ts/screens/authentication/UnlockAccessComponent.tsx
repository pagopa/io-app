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

// A future development will allow different actions to
// be performed if the authentication level is L3.
// At the moment, this screen is not shown with level L3.
// future development story: https://pagopa.atlassian.net/browse/IOPID-1228
export type UnlockAccessProps = {
  authLevel: "L2" | "L3";
};
const UnlockAccessComponent = (props: UnlockAccessProps) => {
  const { authLevel } = props;
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
      <H6 weight="Semibold">{I18n.t("authentication.unlockmodal.title2")}</H6>
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
    if (authLevel === "L2") {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_LANDING
      });
    }
    // for the future developement: add here
    // the navigation to continue the flow
    // future development jira task:
    // https://pagopa.atlassian.net/browse/IOPID-1228
  };

  return (
    <>
      <CustomWizardScreen
        pictogram="accessDenied"
        title={I18n.t("authentication.unlock.title")}
        description={
          authLevel === "L2"
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
            authLevel === "L2"
              ? I18n.t("global.buttons.close")
              : I18n.t("authentication.unlock.loginIO"),
          onPress: onPressActionButton
        }}
      />
      {veryLongAutoResizableBottomSheetWithFooter}
    </>
  );
};

export default UnlockAccessComponent;
