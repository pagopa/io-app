import { Banner, useIOToast, VSpacer } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/core";
import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { helpCenterHowToLoginWithSpidUrl } from "../../../../../config";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { trackHelpCenterCtaTapped } from "../../../../../utils/analytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { SpidIdp } from "../../../../../utils/idps";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { openWebUrl } from "../../../../../utils/url";
import { trackLoginReauthEngagementCieSelected } from "../../../activeSessionLogin/screens/analytics";
import { setIdpSelectedActiveSessionLogin } from "../../../activeSessionLogin/store/actions";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import {
  trackCieLoginSelected,
  trackSpidLoginIdpSelection
} from "../../../common/analytics";
import { trackLoginSpidIdpSelected } from "../../../common/analytics/spidAnalytics";
import { useCieLoginMethodSelection } from "../../../common/hooks/useCieLoginMethodSelection";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { idpSelected } from "../../../common/store/actions";
import IdpsGrid, { IdpsGridSkeleton } from "../components/IdpsGrid";
import { useGetIdps } from "../hooks/useGetIdps";
import { fromIdpToLocalSpidIdp, randomOrderIdps } from "../utils/idps";

type OneIdentityIdpSelectionScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_IDP_SELECTION"
>;

export const OneIdentityIdpSelectionScreen = ({
  navigation,
  route
}: OneIdentityIdpSelectionScreenProps) => {
  const accessibilityFirstFocuseViewRef = useRef<View>(null);

  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  const { state } = useGetIdps();

  const loginFlow = isActiveSessionLogin ? "reauth" : "auth";
  const {
    bottomSheet,
    dismiss: dismissBottomSheet,
    handleCieLoginRequested
  } = useCieLoginMethodSelection({ mode: loginFlow });
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const shuffledIdps = useMemo(() => {
    if (state.status === "success") {
      return randomOrderIdps(fromIdpToLocalSpidIdp(state.data));
    }
    return [];
  }, [state]);

  useOnFirstRender(() => {
    trackSpidLoginIdpSelection(loginFlow);
  });

  useHeaderSecondLevel(
    state.status === "failure"
      ? { title: "", headerShown: false }
      : { title: "", supportRequest: true }
  );

  const HeaderComponent = useMemo(
    () => (
      <Banner
        accessibilityRole="link"
        action={I18n.t("login.help_banner_action")}
        color="neutral"
        content={I18n.t("login.help_banner_content")}
        onPress={() => {
          trackHelpCenterCtaTapped(
            "LOGIN_SPID_IDP_SELECTION",
            helpCenterHowToLoginWithSpidUrl,
            route.name
          );
          openWebUrl(helpCenterHowToLoginWithSpidUrl, () => {
            toast.error(I18n.t("global.jserror.title"));
          });
        }}
        pictogramName="help"
        title={I18n.t("login.help_banner_title")}
      />
    ),
    [route.name, toast]
  );

  const handleIdpSelected = useCallback(
    (idp: SpidIdp) => {
      handleSendAssistanceLog(choosenTool, `IDP selected: ${idp.id}`);
      void trackLoginSpidIdpSelected(idp.id, store.getState(), loginFlow);

      if (isActiveSessionLogin) {
        dispatch(setIdpSelectedActiveSessionLogin(idp));
        navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN
        });
        return;
      }

      dispatch(idpSelected(idp));
      void navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.IDP_LOGIN
      });
    },
    [choosenTool, dispatch, isActiveSessionLogin, loginFlow, navigation, store]
  );

  const ListEmptyComponent = useCallback(() => <IdpsGridSkeleton />, []);
  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(accessibilityFirstFocuseViewRef);

      return dismissBottomSheet;
    }, [dismissBottomSheet])
  );

  const navigateToCiePinScreen = useCallback(() => {
    if (isActiveSessionLogin) {
      void trackLoginReauthEngagementCieSelected();
    } else {
      void trackCieLoginSelected();
    }
    handleCieLoginRequested();
  }, [isActiveSessionLogin, handleCieLoginRequested]);

  const navigateToLandingScreen = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [navigation]);

  if (state.status === "failure") {
    return (
      <>
        <OperationResultScreenContent
          action={{
            label: I18n.t(
              "authentication.idp_selection.loadingError.primaryAction"
            ),
            onPress: navigateToCiePinScreen,
            testID: "idp-loading-error-primary-action"
          }}
          pictogram="umbrella"
          ref={accessibilityFirstFocuseViewRef}
          secondaryAction={{
            label: I18n.t(
              "authentication.idp_selection.loadingError.secondaryAction"
            ),
            onPress: navigateToLandingScreen,
            testID: "idp-loading-error-secondary-action"
          }}
          subtitle={I18n.t(
            "authentication.idp_selection.loadingError.description"
          )}
          title={I18n.t("authentication.idp_selection.loadingError.title")}
        />
        {bottomSheet}
      </>
    );
  }

  return (
    <IdpsGrid
      emptyComponent={ListEmptyComponent}
      footerComponent={<VSpacer size={40} />}
      headerComponent={HeaderComponent}
      headerComponentStyle={{ marginBottom: 8 }}
      idps={shuffledIdps}
      onIdpSelected={handleIdpSelected}
      testID="idps-grid"
    />
  );
};
