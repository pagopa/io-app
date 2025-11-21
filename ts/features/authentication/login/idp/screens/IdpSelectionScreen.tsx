import { ReactElement, createRef, useCallback, useEffect, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Platform, View } from "react-native";
import { Banner, useIOToast, VSpacer } from "@pagopa/io-app-design-system";
import _ from "lodash";
import I18n from "i18next";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import { idpSelected } from "../../../common/store/actions";
import { idpsRemoteValueSelector } from "../../../../../store/reducers/content";
import { idps as idpsFallback, SpidIdp } from "../../../../../utils/idps";
import { loadIdps } from "../../../../../store/actions/content";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { nativeLoginSelector } from "../../../nativeLogin/store/reducers";
import { isNativeLoginEnabledSelector } from "../../../nativeLogin/store/selectors";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import IdpsGrid from "../components/IdpsGrid";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { isReady } from "../../../../../common/model/RemoteValue";
import { trackSpidLoginIdpSelection } from "../../../common/analytics";
import { trackLoginSpidIdpSelected } from "../../../common/analytics/spidAnalytics";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { openWebUrl } from "../../../../../utils/url";
import { helpCenterHowToLoginWithSpidUrl } from "../../../../../config";
import { trackHelpCenterCtaTapped } from "../../../../../utils/analytics";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { setIdpSelectedActiveSessionLogin } from "../../../activeSessionLogin/store/actions";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.idp_selection.contextualHelpTitle",
  body: "authentication.idp_selection.contextualHelpContent"
};

export const randomOrderIdps = <T extends object>(
  array: Array<T> | ReadonlyArray<T>
): Array<T> =>
  array
    .map(value => ({ value, sort: Math.random() })) // Assigns a random value to each array element
    .sort((a, b) => a.sort - b.sort) // Sorts the array according to the random values assigned
    .map(({ value }) => value); // Extract only the original values from the array

/**
 * A screen where the user choose the SPID IPD to login with.
 */
const IdpSelectionScreen = (): ReactElement => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        AuthenticationParamsList,
        "AUTHENTICATION_IDP_SELECTION"
      >
    >();
  const idps = useIOSelector(idpsRemoteValueSelector);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const nativeLoginFeature = useIOSelector(nativeLoginSelector);
  const isNativeLoginFeatureFlagEnabled = useIOSelector(
    isNativeLoginEnabledSelector
  );
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const { error } = useIOToast();
  const { name: routeName } = useRoute();

  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const idpValue = isReady(idps) ? idps.value : idpsFallback;
  const randomIdps = useRef<ReadonlyArray<SpidIdp>>(randomOrderIdps(idpValue));
  const firstIdpsRef = useRef<ReadonlyArray<SpidIdp>>(idpValue);

  const requestIdps = useCallback(
    () => dispatch(loadIdps.request()),
    [dispatch]
  );

  const setSelectedIdp = useCallback(
    (idp: SpidIdp) => dispatch(idpSelected(idp)),
    [dispatch]
  );

  // When the screen is landed, metadata are retrieved.
  // This retrieval causes glitches in 2 different cases:
  // 1. When the app is installed from zero there is no data
  // in memory so there will always be the glitch because the
  // idpsFallback object is shown first while the metadata is retrieved
  // 2. When logging in with the app installed the existing data is
  // shown first -> the call to retrieve the metadata is invoked ->
  // the call is loading so the data of the idpsFallback object is shown ->
  // the data is retrieved and then the array is updated.

  // To resolve the second glitch, the existing metadata (present on the first render)
  // is saved in firstIdpsRef and then compared with the data that is
  // collected after the data is updated (so when it isReady again).
  if (isReady(idps)) {
    if (!_.isEqual(firstIdpsRef.current, idps.value)) {
      // eslint-disable-next-line functional/immutable-data
      randomIdps.current = randomOrderIdps(idps.value);
    }
    // eslint-disable-next-line functional/immutable-data
    firstIdpsRef.current = idps.value;
  }

  const isNativeLoginEnabled = () =>
    (Platform.OS !== "ios" ||
      (Platform.OS === "ios" && parseInt(Platform.Version, 10) > 13)) &&
    nativeLoginFeature.enabled &&
    isNativeLoginFeatureFlagEnabled;

  const onIdpSelected = (idp: SpidIdp) => {
    if (isActiveSessionLogin) {
      dispatch(setIdpSelectedActiveSessionLogin(idp));
      handleSendAssistanceLog(choosenTool, `IDP selected: ${idp.id}`);
      if (isNativeLoginEnabled()) {
        navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.AUTH_SESSION
        });
      } else {
        navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN
        });
      }
    } else {
      setSelectedIdp(idp);
      handleSendAssistanceLog(choosenTool, `IDP selected: ${idp.id}`);
      void trackLoginSpidIdpSelected(idp.id, store.getState());
      if (isNativeLoginEnabled()) {
        navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.AUTH_SESSION
        });
      } else {
        navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.IDP_LOGIN
        });
      }
    }
  };

  useOnFirstRender(() => {
    trackSpidLoginIdpSelection(isActiveSessionLogin ? "reauth" : "auth");
  });

  useEffect(() => {
    requestIdps();
  }, [requestIdps]);

  const headerComponent = () => {
    const viewRef = createRef<View>();

    return (
      <>
        <Banner
          ref={viewRef}
          color="neutral"
          title={I18n.t("login.help_banner_title")}
          content={I18n.t("login.help_banner_content")}
          accessibilityRole="link"
          action={I18n.t("login.help_banner_action")}
          onPress={() => {
            trackHelpCenterCtaTapped(
              "LOGIN_SPID_IDP_SELECTION",
              helpCenterHowToLoginWithSpidUrl,
              routeName
            );
            openWebUrl(helpCenterHowToLoginWithSpidUrl, () => {
              error(I18n.t("global.jserror.title"));
            });
          }}
          pictogramName="help"
        />
        <VSpacer size={8} />
      </>
    );
  };
  useHeaderSecondLevel({
    title: "",
    contextualHelpMarkdown,
    supportRequest: true,
    faqCategories: ["authentication_IPD_selection"]
  });

  return (
    <IdpsGrid
      testID="idps-grid"
      idps={randomIdps.current}
      onIdpSelected={onIdpSelected}
      headerComponent={headerComponent}
      footerComponent={<VSpacer size={40} />}
    />
  );
};

export default IdpSelectionScreen;
