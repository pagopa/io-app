/**
 * A screen to show the app Terms of Service. If the user accepted an old version
 * of ToS and a new version is available, an alert is displayed to highlight the user
 * has to accept the new version of ToS.
 * This screen is used also as Privacy screen From Profile section.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import { Body } from "../../components/core/typography/Body";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import TosWebviewComponent from "../../components/TosWebviewComponent";
import { privacyUrl, tosVersion } from "../../config";
import I18n from "../../i18n";
import { abortOnboarding, tosAccepted } from "../../store/actions/onboarding";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  isProfileFirstOnBoarding,
  profileSelector
} from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";
import { H1 } from "../../components/core/typography/H1";

const styles = StyleSheet.create({
  titlePadding: {
    paddingVertical: customVariables.spacingBase,
    paddingHorizontal: customVariables.contentPadding
  },
  alert: {
    backgroundColor: customVariables.toastColor,
    borderRadius: 4,
    marginTop: customVariables.spacerExtrasmallHeight,
    marginBottom: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "flex-start"
  },
  webViewContainer: {
    flex: 1
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the ToS to the user.
 */
const OnboardingTosScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useIODispatch();
  const potProfile = useIOSelector(profileSelector);

  const isUpdatingProfile = pot.isUpdating(potProfile);
  const hasProfileError = pot.isError(potProfile);

  const hasAcceptedCurrentTos = pot.getOrElse(
    pot.map(potProfile, p => p.accepted_tos_version === tosVersion),
    false
  );
  const hasAcceptedOldTosVersion = pot.getOrElse(
    pot.map(
      potProfile,
      p =>
        !isProfileFirstOnBoarding(p) && // it's not the first onboarding
        p.accepted_tos_version !== undefined &&
        p.accepted_tos_version < tosVersion
    ),
    false
  );

  useEffect(() => {
    if (hasProfileError) {
      showToast(I18n.t("global.genericError"));
    }
  }, [hasProfileError]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleReload = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  const handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: () => dispatch(abortOnboarding())
        }
      ]
    );

  return (
    <LoadingSpinnerOverlay isLoading={isLoading || isUpdatingProfile}>
      <BaseScreenComponent
        goBack={handleGoBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["privacy"]}
        headerTitle={I18n.t("onboarding.tos.headerTitle")}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.titlePadding}>
            <H1
              accessible={true}
              accessibilityRole="header"
              weight="Bold"
              testID={"screen-content-header-title"}
              color={"bluegreyDark"}
            >
              {I18n.t("profile.main.privacy.privacyPolicy.title")}
            </H1>
          </View>
          {!hasAcceptedCurrentTos && (
            <View
              style={[styles.alert, styles.titlePadding]}
              testID={"currentToSNotAcceptedView"}
            >
              <Body testID={"currentToSNotAcceptedText"}>
                {hasAcceptedOldTosVersion
                  ? I18n.t("profile.main.privacy.privacyPolicy.updated")
                  : I18n.t("profile.main.privacy.privacyPolicy.infobox")}
              </Body>
            </View>
          )}
          <TosWebviewComponent
            handleLoadEnd={handleLoadEnd}
            handleReload={handleReload}
            webViewSource={{ uri: privacyUrl }}
            shouldRenderFooter={!isLoading}
            onExit={handleGoBack}
            onAcceptTos={() => dispatch(tosAccepted(tosVersion))}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default OnboardingTosScreen;
