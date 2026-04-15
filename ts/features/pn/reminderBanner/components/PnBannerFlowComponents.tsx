import {
  Body,
  ContentWrapper,
  H2,
  H6,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Dimensions, Image, View } from "react-native";
import I18n from "i18next";
import landingHeroImage from "../../../../../img/features/pn/activationLandingHero.png";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../utils/url";
import LoadingComponent from "../../../fci/components/LoadingComponent";
import { sendBannerMixpanelEvents } from "../../analytics/activationReminderBanner";
import {
  PnBannerFlowStateKey,
  pnBannerFlowStateEnum
} from "../screens/PnReminderBannerFlow";

// ---------------------------- COMPONENT TYPES ---------------------------

type SuccessFlowStateKeys = Extract<
  PnBannerFlowStateKey,
  "SUCCESS_ACTIVATION" | "ALREADY_ACTIVE"
>;
type SuccessFlowStateProps = { flowState: SuccessFlowStateKeys };

type ErrorFlowStateKeys =
  | Extract<
      PnBannerFlowStateKey,
      "FAILURE_ACTIVATION" | "FAILURE_DETAILS_FETCH"
    >
  | "MISSING-SID";
type ErrorFlowStateProps = {
  flowState: ErrorFlowStateKeys;
};
type LoadingStateProps = {
  loadingState: "LOADING-ACTIVATION" | "LOADING-DATA";
};

// ---------------------------- COMPONENTS ---------------------------

const LoadingScreen = ({ loadingState }: LoadingStateProps) => (
  <LoadingComponent
    testID={`loading-${loadingState}`}
    captionTitle={I18n.t(
      `features.pn.reminderBanner.activationFlow.${loadingState}.title`
    )}
  />
);

const SuccessScreen = ({ flowState }: SuccessFlowStateProps) => {
  const navigation = useIONavigation();
  useOnFirstRender(() => {
    if (flowState === "ALREADY_ACTIVE") {
      sendBannerMixpanelEvents.alreadyActive();
    }
    if (flowState === "SUCCESS_ACTIVATION") {
      sendBannerMixpanelEvents.activationSuccess();
    }
  });

  return (
    <OperationResultScreenContent
      testID={`success-${flowState}`}
      title={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.title`
      )}
      subtitle={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.body`
      )}
      action={{
        testID: "success-cta",
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.navigate(...navigateHomeParams)
      }}
      pictogram="success"
    />
  );
};

const ErrorScreen = ({ flowState }: ErrorFlowStateProps) => {
  const navigation = useIONavigation();
  useOnFirstRender(() => {
    sendBannerMixpanelEvents.bannerKO(flowState);
  });
  return (
    <OperationResultScreenContent
      testID={`error-${flowState}`}
      title={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.title`
      )}
      subtitle={I18n.t(
        `features.pn.reminderBanner.activationFlow.${flowState}.body`
      )}
      action={{
        testID: "error-cta",
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.navigate(...navigateHomeParams)
      }}
      pictogram="umbrella"
    />
  );
};

const ctaScreenBaseI18nKey =
  "features.pn.reminderBanner.activationFlow.WAITING_USER_INPUT" as const;
const CtaScreen = ({
  scrollViewAction
}: {
  scrollViewAction: IOScrollViewActions;
}) => {
  const screenWidth = Dimensions.get("screen").width;

  return (
    <IOScrollView
      actions={scrollViewAction}
      testID={`cta-${pnBannerFlowStateEnum.WAITING_USER_INPUT}`}
      contentContainerStyle={{ paddingHorizontal: 0 }}
    >
      <Image
        source={landingHeroImage}
        style={{
          width: screenWidth,
          height: screenWidth * (3 / 4)
        }}
        resizeMethod="scale"
        accessibilityIgnoresInvertColors={true}
        resizeMode="contain"
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H2 accessibilityRole="header">
          {I18n.t(`${ctaScreenBaseI18nKey}.title`)}
        </H2>
        <VSpacer size={24} />

        <H6>{I18n.t(`${ctaScreenBaseI18nKey}.paragraph1.title`)}</H6>
        <VSpacer size={8} />
        <Body>{I18n.t(`${ctaScreenBaseI18nKey}.paragraph1.body`)}</Body>

        <VSpacer size={24} />
        <H6>{I18n.t(`${ctaScreenBaseI18nKey}.paragraph2.title`)}</H6>
        <VSpacer size={8} />
        <Body>{I18n.t(`${ctaScreenBaseI18nKey}.paragraph2.body`)}</Body>

        <VSpacer size={24} />
        <H6>{I18n.t(`${ctaScreenBaseI18nKey}.paragraph3.title`)}</H6>
        <VSpacer size={8} />
        <Body>{I18n.t(`${ctaScreenBaseI18nKey}.paragraph3.body`)}</Body>

        <VSpacer size={24} />
        <Paragraph4 />
      </ContentWrapper>
    </IOScrollView>
  );
};

const Paragraph4 = () => {
  const tosConfig = useIOSelector(pnPrivacyUrlsSelector);
  const { privacy: privacyUrl, tos: tosUrl } = tosConfig;

  return (
    <View>
      <Body>
        {I18n.t(`${ctaScreenBaseI18nKey}.paragraph4.pressing`)}
        <Body weight="Semibold">
          {I18n.t(`${ctaScreenBaseI18nKey}.paragraph4.activate`)}
        </Body>
        {I18n.t(`${ctaScreenBaseI18nKey}.paragraph4.readAndUnderstood`)}
        <Body
          testID="privacy-url"
          asLink={true}
          onPress={() => openWebUrl(privacyUrl)}
        >
          {I18n.t(`${ctaScreenBaseI18nKey}.paragraph4.privacyInfo`)}
        </Body>
        {I18n.t(`${ctaScreenBaseI18nKey}.paragraph4.andThe`)}
        <Body testID="tos-url" asLink={true} onPress={() => openWebUrl(tosUrl)}>
          {I18n.t(`${ctaScreenBaseI18nKey}.paragraph4.TOS`)}
        </Body>
      </Body>
    </View>
  );
};

export const PnBannerFlowComponents = {
  LoadingScreen,
  SuccessScreen,
  ErrorScreen,
  CtaScreen
};

const navigateHomeParams = [
  ROUTES.MAIN,
  {
    screen: "MESSAGES_HOME"
  }
] as const;
