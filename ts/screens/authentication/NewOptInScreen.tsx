import React from "react";
import { Dimensions, View } from "react-native";
import {
  Badge,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  LabelLink,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../utils/url";
import ROUTES from "../../navigation/routes";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import I18n from "../../i18n";
import { setFastLoginOptIn } from "../../features/fastLogin/store/actions/optInActions";
import { useIODispatch } from "../../store/hooks";
import { TranslationKeys } from "../../../locales/locales";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.opt-in.contextualHelpTitle",
  body: "authentication.opt-in.contextualHelpContent"
};

export type ChosenIdentifier = {
  identifier: "SPID" | "CIE";
};

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_OPT_IN"
>;

const NewOptInScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const navigation = useNavigation();

  const navigateToIdpPage = (isLV: boolean) => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        props.route.params.identifier === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
    dispatch(setFastLoginOptIn({ enabled: isLV }));
  };

  const renderItem = (value: TranslationKeys) => (
    <LabelSmall weight="Regular" color="grey-700">
      {I18n.t(value)}{" "}
      <LabelLink
        onPress={() => openWebUrl("https://ioapp.it/")}
        testID="link-test"
      >
        {I18n.t("authentication.opt-in.io-site")}
      </LabelLink>
    </LabelSmall>
  );

  const ModalContent = () => (
    <>
      <FeatureInfo
        iconName="biomFingerprint"
        body={I18n.t("authentication.opt-in.fingerprint")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="logout"
        body={renderItem("authentication.opt-in.io-logout")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="locked"
        body={renderItem("authentication.opt-in.io-lock-access")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="device"
        body={I18n.t("authentication.opt-in.access-new-device")}
      />
    </>
  );

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("authentication.opt-in.security-suggests"),
      component: <ModalContent />,
      fullScreen: true
    },
    120
  );

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <GradientScrollView
        testID="container-test"
        primaryActionProps={{
          label: I18n.t("authentication.opt-in.button-accept-lv"),
          accessibilityLabel: I18n.t("authentication.opt-in.button-accept-lv"),
          onPress: () => navigateToIdpPage(true),
          testID: "accept-button-test"
        }}
        secondaryActionProps={{
          label: I18n.t("authentication.opt-in.button-decline-lv"),
          accessibilityLabel: I18n.t("authentication.opt-in.button-decline-lv"),
          onPress: () => navigateToIdpPage(false),
          testID: "decline-button-test"
        }}
      >
        <ContentWrapper>
          {Dimensions.get("screen").height > 780 && (
            <View style={IOStyles.selfCenter} testID="pictogram-test">
              <Pictogram name="passcode" size={120} />
            </View>
          )}
          <VSpacer size={24} />
          <View style={IOStyles.selfCenter}>
            <Badge
              text={I18n.t("authentication.opt-in.news")}
              variant="info"
              testID="badge-test"
            />
          </View>
          <VSpacer size={24} />
          <H3
            style={{ textAlign: "center", alignItems: "center" }}
            testID="title-test"
          >
            {I18n.t("authentication.opt-in.title")}
          </H3>
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="identityCheck"
            body={I18n.t("authentication.opt-in.identity-check")}
            actionLabel={I18n.t("authentication.opt-in.security-suggests")}
            actionOnPress={presentVeryLongAutoresizableBottomSheetWithFooter}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="passcode"
            body={I18n.t("authentication.opt-in.passcode")}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="notification"
            body={I18n.t("authentication.opt-in.notification")}
          />
        </ContentWrapper>
        {veryLongAutoResizableBottomSheetWithFooter}
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default NewOptInScreen;
