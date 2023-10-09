import React from "react";
import { View } from "react-native";
import {
  Badge,
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

export type ChoosedIdentifier = {
  identifier: "SPID" | "CIE";
};

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_OPT_IN"
>;

const NewOptInScreen = (props: Props) => {
  const navigation = useNavigation();

  const navigateToIdpPage = () => {
    // FIXME -> add business logic using selector -> https://pagopa.atlassian.net/browse/IOPID-894 (add navigation to cie or idp screen)
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        props.route.params.identifier === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
  };

  const dismiss = () => {
    dismissVeryLongAutoresizableBottomSheetWithFooter();
  };

  const ModalContent = () => (
    <>
      <FeatureInfo
        iconName="biomFingerprint"
        body={I18n.t("authentication.opt-in.fingerprint")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="logout"
        body={I18n.t("authentication.opt-in.io-logout")}
        actionLabel={I18n.t("authentication.opt-in.io-site")}
        actionOnPress={() => openWebUrl("https://ioapp.it/it/accedi")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="locked"
        body={I18n.t("authentication.opt-in.io-lock-access")}
        actionLabel={I18n.t("authentication.opt-in.io-site")}
        actionOnPress={() => openWebUrl("https://ioapp.it/it/accedi")}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="device"
        body={I18n.t("authentication.opt-in.access-new-device")}
      />
    </>
  );

  const defaultFooter = (
    <ContentWrapper>
      <VSpacer size={16} />
      <ButtonSolid
        fullWidth
        accessibilityLabel="Tap to dismiss the bottom sheet"
        label={I18n.t("authentication.opt-in.close-modal-button")}
        onPress={dismiss}
      />
      <VSpacer size={16} />
    </ContentWrapper>
  );

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter,
    dismiss: dismissVeryLongAutoresizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("authentication.opt-in.security-suggests"),
      component: <ModalContent />,
      footer: defaultFooter,
      fullScreen: true
    },
    180
  );

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <GradientScrollView
        testID="container-test"
        primaryAction={
          <ButtonSolid
            fullWidth
            label={I18n.t("authentication.opt-in.button-accept-lv")}
            accessibilityLabel={"Click to continue with fast access"}
            onPress={navigateToIdpPage}
            testID="accept-button-test"
          />
        }
        secondaryAction={
          <ButtonLink
            label={I18n.t("authentication.opt-in.button-decline-lv")}
            accessibilityLabel={"Click to continue with classic access"}
            onPress={navigateToIdpPage}
            testID="decline-button-test"
          />
        }
      >
        <ContentWrapper>
          <View style={IOStyles.selfCenter} testID="pictogram-test">
            <Pictogram name="passcode" size={120} />
          </View>
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
          {/* FIXME -> add pictogram into design system https://pagopa.atlassian.net/browse/IOPID-953 */}
          <FeatureInfo
            pictogramName="identityCheck"
            body={I18n.t("authentication.opt-in.notification")}
          />
        </ContentWrapper>
        {veryLongAutoResizableBottomSheetWithFooter}
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default NewOptInScreen;
