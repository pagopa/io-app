import { useRef } from "react";
import { View } from "react-native";
import {
  ContentWrapper,
  FeatureInfo,
  H3,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  NavigatorScreenParams,
  Route,
  useFocusEffect,
  useRoute
} from "@react-navigation/native";
import I18n from "i18next";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { setFastLoginOptIn } from "../../../fastLogin/store/actions/optInActions";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackLoginSessionOptIn,
  trackLoginSessionOptIn30,
  trackLoginSessionOptIn365,
  trackLoginSessionOptInInfo
} from "../../../fastLogin/analytics/optinAnalytics";
import { useSecuritySuggestionsBottomSheet } from "../../../../../hooks/useSecuritySuggestionBottomSheet";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { useDetectSmallScreen } from "../../../../../hooks/useDetectSmallScreen";
import { IOScrollView } from "../../../../../components/ui/IOScrollView";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { setFastLoginOptSessionLogin } from "../../../activeSessionLogin/store/actions";
import { CieIdLoginProps } from "../../cie/shared/utils";

export enum Identifier {
  SPID = "SPID",
  CIE = "CIE",
  CIE_ID = "CIE_ID",
  TEST = "TEST"
}
const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.opt_in.contextualHelpTitle",
  body: "authentication.opt_in.contextualHelpContent"
};

export type ChosenIdentifier =
  | {
      identifier: Identifier.SPID | Identifier.CIE | Identifier.TEST;
    }
  | {
      identifier: Identifier.CIE_ID;
      params: CieIdLoginProps;
    };

const OptInScreen = () => {
  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown
  });

  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const {
    securitySuggestionBottomSheet,
    presentSecuritySuggestionBottomSheet
  } = useSecuritySuggestionsBottomSheet();
  const { params } =
    useRoute<Route<"AUTHENTICATION_OPT_IN", ChosenIdentifier>>();
  const navigation = useIONavigation();
  const store = useIOStore();

  const authScreensMap = {
    CIE: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN,
    SPID: AUTHENTICATION_ROUTES.IDP_SELECTION,
    CIE_ID: isActiveSessionLogin
      ? AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
      : AUTHENTICATION_ROUTES.CIE_ID_LOGIN,
    TEST: AUTHENTICATION_ROUTES.IDP_TEST
  };

  const { isDeviceScreenSmall } = useDetectSmallScreen();

  useOnFirstRender(() => {
    trackLoginSessionOptIn(isActiveSessionLogin);
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
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, getNavigationParams());
    if (isActiveSessionLogin) {
      dispatch(setFastLoginOptSessionLogin(isLV));
    } else {
      dispatch(setFastLoginOptIn({ enabled: isLV }));
    }
  };

  return (
    <IOScrollView
      testID="container-test"
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("authentication.opt_in.button_accept_lv"),
          accessibilityLabel: I18n.t("authentication.opt_in.button_accept_lv"),
          onPress: () => navigateToIdpPage(true),
          testID: "accept-button-test"
        },
        secondary: {
          label: I18n.t("authentication.opt_in.button_decline_lv"),
          accessibilityLabel: I18n.t("authentication.opt_in.button_decline_lv"),
          onPress: () => navigateToIdpPage(false),
          testID: "decline-button-test"
        }
      }}
    >
      <ContentWrapper>
        {/*
          if the device height is > 820 then the pictogram will be visible,
          otherwise it will not be visible
          */}
        {!isDeviceScreenSmall && (
          <View style={{ alignSelf: "center" }} testID="pictogram-test">
            <Pictogram name="passcode" size={120} />
          </View>
        )}
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
          pictogramProps={{
            name: "identityCheck"
          }}
          body={I18n.t("authentication.opt_in.identity_check")}
        />
        <VSpacer size={24} />
        <FeatureInfo
          pictogramProps={{
            name: "passcode"
          }}
          body={I18n.t("authentication.opt_in.passcode")}
        />
        <VSpacer size={24} />
        <FeatureInfo
          pictogramProps={{
            name: "notification"
          }}
          body={I18n.t("authentication.opt_in.notification")}
          action={{
            accessibilityRole: "button",
            label: I18n.t("authentication.opt_in.security_suggests"),
            onPress: () => {
              trackLoginSessionOptInInfo(isActiveSessionLogin);
              return presentSecuritySuggestionBottomSheet();
            }
          }}
        />
      </ContentWrapper>
      {securitySuggestionBottomSheet}
    </IOScrollView>
  );
};

export default OptInScreen;
