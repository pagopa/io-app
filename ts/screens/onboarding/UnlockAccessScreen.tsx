import React from "react";
import {
  Body,
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  Label,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../utils/url";
import ROUTES from "../../navigation/routes";

const UnlockAccessScreen = () => {
  const navigation = useNavigation();
  const ModalContent = () => (
    <View>
      <Body weight="Regular" color="grey-700">
        {I18n.t("authentication.unlockmodal.description1_1")}
        {"\n"}
        {I18n.t("authentication.unlockmodal.description1_2")}{" "}
        <Label weight="Bold">
          {I18n.t("authentication.unlockmodal.description1_3")}{" "}
        </Label>
        {I18n.t("authentication.unlockmodal.description1_4")}{" "}
      </Body>
      <VSpacer size={24} />
      <H3 weight="SemiBold">{I18n.t("authentication.unlockmodal.title2")}</H3>
      <VSpacer size={24} />
      <FeatureInfo
        iconName="security"
        body={I18n.t("authentication.unlockmodal.listitem1")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="security"
        body={I18n.t("authentication.unlockmodal.listitem2_1")}
        actionLabel={I18n.t("authentication.unlockmodal.listitem2_2")}
        actionOnPress={() => openWebUrl("https://ioapp.it/")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="security"
        body={
          <LabelSmall weight="Regular" color="grey-700">
            {I18n.t("authentication.unlockmodal.listitem3_1")}{" "}
            <Text style={{ fontStyle: "italic" }}>
              {I18n.t("authentication.unlockmodal.listitem3_2")}{" "}
            </Text>
            {I18n.t("authentication.unlockmodal.listitem3_3")}{" "}
            <Text style={{ fontWeight: "bold" }}>
              {I18n.t("authentication.unlockmodal.listitem3_4")}{" "}
            </Text>
            {I18n.t("authentication.unlockmodal.listitem3_5")}
          </LabelSmall>
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
    120
  );

  return (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
    >
      <GradientScrollView
        testID="container-test"
        primaryAction={
          <ButtonSolid
            fullWidth
            label={I18n.t("authentication.unlock.title")}
            accessibilityLabel="Click here to unlock your profile"
            onPress={() => openWebUrl("https://ioapp.it/")}
          />
        }
        secondaryAction={
          <ButtonLink
            label={I18n.t("authentication.unlock.loginIO")}
            accessibilityLabel="Click here to redirect to the landing screen"
            onPress={() => navigation.navigate(ROUTES.AUTHENTICATION_LANDING)}
          />
        }
      >
        <SafeAreaView style={IOStyles.flex}>
          <VSpacer size={40} />
          <VSpacer size={40} />
          <ContentWrapper>
            <View style={IOStyles.selfCenter}>
              <Pictogram name="accessDenied" size={120} color="aqua" />
            </View>
            <VSpacer size={16} />
            <View style={IOStyles.alignCenter}>
              <H3 weight="SemiBold">{I18n.t("authentication.unlock.title")}</H3>
            </View>
            <VSpacer size={16} />
            <View>
              <Body
                weight="Regular"
                style={{ textAlign: "center" }}
                testID="subtitle-test"
                color="grey-650"
              >
                {I18n.t("authentication.unlock.subtitle")}
              </Body>
            </View>
            <VSpacer size={16} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink
                label={I18n.t("authentication.unlock.learnmore")}
                onPress={presentVeryLongAutoresizableBottomSheetWithFooter}
                testID="link-test"
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
