import React from "react";
import {
  Body,
  ButtonLink,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  H6,
  IOColors,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../utils/url";
import ROUTES from "../../navigation/routes";
import { useIONavigation } from "../../navigation/params/AppParamsList";

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

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
    >
      <GradientScrollView
        testID="container-test"
        primaryActionProps={{
          testID: "button-solid-test",
          label: I18n.t("authentication.unlock.title"),
          accessibilityLabel: I18n.t("authentication.unlock.title"),
          onPress: () => openWebUrl("https://ioapp.it/")
        }}
        secondaryActionProps={{
          testID: "button-link-test",
          label: I18n.t("authentication.unlock.loginIO"),
          accessibilityLabel: I18n.t("authentication.unlock.loginIO"),
          onPress: () =>
            navigation.navigate(ROUTES.AUTHENTICATION, {
              screen: ROUTES.AUTHENTICATION_LANDING
            })
        }}
      >
        <SafeAreaView>
          <ContentWrapper>
            <View style={IOStyles.selfCenter}>
              <Pictogram name="accessDenied" size={120} color="aqua" />
            </View>
            <VSpacer size={16} />
            <View style={IOStyles.alignCenter}>
              <H3 testID="title-test" weight="SemiBold">
                {I18n.t("authentication.unlock.title")}
              </H3>
            </View>
            <VSpacer size={16} />
            <View>
              <Body
                weight="Regular"
                style={{ textAlign: "center" }}
                testID="subtitle-test"
                color="grey-650"
              >
                {identifier === "SPID"
                  ? I18n.t("authentication.unlock.subtitlel2")
                  : I18n.t("authentication.unlock.subtitlel3")}
              </Body>
            </View>
            <VSpacer size={16} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink
                label={I18n.t("authentication.unlock.learnmore")}
                onPress={presentVeryLongAutoresizableBottomSheetWithFooter}
                testID="learn-more-link-test"
              />
            </View>
          </ContentWrapper>
          {veryLongAutoResizableBottomSheetWithFooter}
        </SafeAreaView>
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default UnlockAccessScreen;
