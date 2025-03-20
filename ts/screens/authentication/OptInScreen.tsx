import { useRef } from "react";
import { Dimensions, View } from "react-native";
import {
  Badge,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  NavigatorScreenParams,
  Route,
  useFocusEffect,
  useRoute
} from "@react-navigation/native";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ROUTES from "../../navigation/routes";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import I18n from "../../i18n";
import { setFastLoginOptIn } from "../../features/fastLogin/store/actions/optInActions";
import { useIODispatch, useIOStore } from "../../store/hooks";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import {
  trackLoginSessionOptIn,
  trackLoginSessionOptIn30,
  trackLoginSessionOptIn365,
  trackLoginSessionOptInInfo
} from "../../features/fastLogin/analytics/optinAnalytics";
import { useSecuritySuggestionsBottomSheet } from "../../hooks/useSecuritySuggestionBottomSheet";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { CieIdLoginProps } from "../../features/cieLogin/components/CieIdLoginWebView";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";

export enum Identifier {
  SPID = "SPID",
  CIE = "CIE",
  CIE_ID = "CIE_ID"
}
const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.opt_in.contextualHelpTitle",
  body: "authentication.opt_in.contextualHelpContent"
};

export type ChosenIdentifier =
  | {
      identifier: Identifier.SPID | Identifier.CIE;
    }
  | {
      identifier: Identifier.CIE_ID;
      params: CieIdLoginProps;
    };

export const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 820;

const authScreensMap = {
  CIE: ROUTES.CIE_PIN_SCREEN,
  SPID: ROUTES.AUTHENTICATION_IDP_SELECTION,
  CIE_ID: ROUTES.AUTHENTICATION_CIE_ID_LOGIN
};

const OptInScreen = () => {
  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown
  });

  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  const dispatch = useIODispatch();
  const {
    securitySuggestionBottomSheet,
    presentSecuritySuggestionBottomSheet
  } = useSecuritySuggestionsBottomSheet();
  const { params } =
    useRoute<Route<"AUTHENTICATION_OPT_IN", ChosenIdentifier>>();
  const navigation = useIONavigation();
  const store = useIOStore();

  useOnFirstRender(() => {
    trackLoginSessionOptIn();
  });

  useFocusEffect(() => setAccessibilityFocus(accessibilityFirstFocuseViewRef));

  const getNavigationParams =
    (): NavigatorScreenParams<AuthenticationParamsList> => {
      if (params.identifier === "CIE_ID") {
        return {
          screen: authScreensMap[params.identifier],
          params: params.params
        };
      }

      return { screen: authScreensMap[params.identifier] };
    };

  const navigateToIdpPage = (isLV: boolean) => {
    if (isLV) {
      void trackLoginSessionOptIn365(store.getState());
    } else {
      void trackLoginSessionOptIn30(store.getState());
    }
    navigation.navigate(ROUTES.AUTHENTICATION, getNavigationParams());
    dispatch(setFastLoginOptIn({ enabled: isLV }));
  };

  return (
    <GradientScrollView
      testID="container-test"
      primaryActionProps={{
        label: I18n.t("authentication.opt_in.button_accept_lv"),
        accessibilityLabel: I18n.t("authentication.opt_in.button_accept_lv"),
        onPress: () => navigateToIdpPage(true),
        testID: "accept-button-test"
      }}
      secondaryActionProps={{
        label: I18n.t("authentication.opt_in.button_decline_lv"),
        accessibilityLabel: I18n.t("authentication.opt_in.button_decline_lv"),
        onPress: () => navigateToIdpPage(false),
        testID: "decline-button-test"
      }}
    >
      <ContentWrapper>
        {/*
          if the device height is > 820 then the pictogram will be visible,
          otherwise it will not be visible
          */}
        {Dimensions.get("screen").height > MIN_HEIGHT_TO_SHOW_FULL_RENDER && (
          <View style={IOStyles.selfCenter} testID="pictogram-test">
            <Pictogram name="passcode" size={120} />
          </View>
        )}
        <VSpacer size={24} />
        <View style={IOStyles.selfCenter}>
          <Badge
            text={I18n.t("authentication.opt_in.news")}
            variant="highlight"
            testID="badge-test"
          />
        </View>
        <VSpacer size={24} />
        <View accessible={true} ref={accessibilityFirstFocuseViewRef}>
          <H3
            accessible={true}
            style={{ textAlign: "center", alignItems: "center" }}
            testID="title-test"
          >
            {I18n.t("authentication.opt_in.title")}
          </H3>
        </View>
        <VSpacer size={24} />
        <FeatureInfo
          pictogramName="identityCheck"
          body={I18n.t("authentication.opt_in.identity_check")}
        />
        <VSpacer size={24} />
        <FeatureInfo
          pictogramName="passcode"
          body={I18n.t("authentication.opt_in.passcode")}
        />
        <VSpacer size={24} />
        <FeatureInfo
          pictogramName="notification"
          body={I18n.t("authentication.opt_in.notification")}
          action={{
            accessibilityRole: "button",
            label: I18n.t("authentication.opt_in.security_suggests"),
            onPress: () => {
              trackLoginSessionOptInInfo();
              return presentSecuritySuggestionBottomSheet();
            }
          }}
        />
      </ContentWrapper>
      {securitySuggestionBottomSheet}
    </GradientScrollView>
  );
};

export default OptInScreen;
