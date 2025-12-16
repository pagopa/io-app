/**
 * A screen to show the app Terms of Service. If the user accepted an old version
 * of ToS and a new version is available, an alert is displayed to highlight the user
 * has to accept the new version of ToS.
 * This screen is used also as Privacy screen From Profile section.
 */
import {
  Alert as AlertDS,
  ContentWrapper,
  H2,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { getFlowType } from "../../../utils/analytics";
import { ContextualHelpPropsMarkdown } from "../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { trackTosUserExit } from "../../authentication/common/analytics";
import {
  isProfileFirstOnBoardingSelector,
  profileSelector
} from "../../settings/common/store/selectors";
import { isProfileFirstOnBoarding } from "../../settings/common/store/utils/guards";
import {
  trackTosAccepted,
  trackTosScreen
} from "../../settings/privacy/shared/analytics";
import TosWebviewComponent from "../../settings/privacy/shared/components/TosWebviewComponent";
import { tosConfigSelector } from "../../tos/store/selectors";
import { abortOnboarding, tosAccepted } from "../store/actions";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the ToS to the user.
 */
const OnboardingTosScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  const store = useIOStore();
  const dispatch = useIODispatch();
  const potProfile = useIOSelector(profileSelector);

  const isUpdatingProfile = pot.isUpdating(potProfile);
  const hasProfileError = pot.isError(potProfile);

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    trackTosScreen(getFlowType(true, isFirstOnBoarding));
  });

  const tosConfig = useIOSelector(tosConfigSelector);
  const tosVersion = tosConfig.tos_version;
  const privacyUrl = tosConfig.tos_url;

  const flow = getFlowType(true, isFirstOnBoarding);

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
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [hasProfileError]);

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleReload = () => {
    setIsLoading(true);
  };
  const onAcceptTos = useCallback(() => {
    dispatch(tosAccepted(tosVersion));
    void trackTosAccepted(tosVersion, flow, store.getState());
  }, [dispatch, flow, store, tosVersion]);

  const handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.exitAlert.title"),
      I18n.t("onboarding.exitAlert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: () => {
            trackTosUserExit(flow);
            dispatch(abortOnboarding());
          }
        }
      ]
    );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    goBack: handleGoBack,
    contextualHelpMarkdown,
    faqCategories: ["privacy"]
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading || isUpdatingProfile}>
      <ContentWrapper>
        <H2
          accessible={true}
          accessibilityRole="header"
          testID="screen-content-header-title"
        >
          {I18n.t("profile.main.privacy.privacyPolicy.title")}
        </H2>
        <VSpacer size={16} />
      </ContentWrapper>
      {!hasAcceptedCurrentTos && (
        <ContentWrapper testID={"currentToSNotAcceptedView"}>
          <AlertDS
            testID="currentToSNotAcceptedText"
            variant="info"
            content={
              hasAcceptedOldTosVersion
                ? I18n.t("profile.main.privacy.privacyPolicy.updated")
                : I18n.t("profile.main.privacy.privacyPolicy.infobox")
            }
          />
        </ContentWrapper>
      )}
      <TosWebviewComponent
        flow={flow}
        handleLoadEnd={handleLoadEnd}
        handleReload={handleReload}
        webViewSource={{ uri: privacyUrl }}
        shouldRenderFooter={!isLoading}
        onAcceptTos={onAcceptTos}
      />
    </LoadingSpinnerOverlay>
  );
};

export default OnboardingTosScreen;
