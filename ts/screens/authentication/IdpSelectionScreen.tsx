import React, {
  ReactElement,
  createRef,
  useCallback,
  useEffect,
  useState
} from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSelector, useStore } from "react-redux";
import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { idpSelected } from "../../store/actions/authentication";
import { idpsSelector, randomOrderIdps } from "../../store/reducers/content";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { LocalIdpsFallback } from "../../utils/idps";
import { loadIdps } from "../../store/actions/content";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import ROUTES from "../../navigation/routes";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import { IdpData } from "../../../definitions/content/IdpData";
import { nativeLoginSelector } from "../../features/nativeLogin/store/reducers";
import { isNativeLoginEnabledSelector } from "../../features/nativeLogin/store/selectors";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import IdpsGridRevamp from "../../components/IdpsGridRevamp";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { trackSpidLoginIdpSelection } from "./analytics";
import { trackLoginSpidIdpSelected } from "./analytics/spidAnalytics";

const TestIdp: SpidIdp = {
  id: "test" as keyof IdpData,
  name: "Test Idp",
  logo: "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid.png",
  profileUrl: "",
  isTestIdp: true
};

const TAPS_TO_OPEN_TESTIDP = 5;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.idp_selection.contextualHelpTitle",
  body: "authentication.idp_selection.contextualHelpContent"
};

/**
 * A screen where the user choose the SPID IPD to login with.
 */
const IdpSelectionScreen = (): ReactElement => {
  useOnFirstRender(() => {
    trackSpidLoginIdpSelection();
  });
  const dispatch = useIODispatch();
  const idps = useIOSelector(idpsSelector);
  const randomIdps = randomOrderIdps(idps);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const nativeLoginFeature = useIOSelector(nativeLoginSelector);

  const requestIdps = useCallback(
    () => dispatch(loadIdps.request()),
    [dispatch]
  );
  const setSelectedIdp = useCallback(
    (idp: SpidIdp) => dispatch(idpSelected(idp)),
    [dispatch]
  );

  const [counter, setCounter] = useState(0);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const navigation =
    useNavigation<
      IOStackNavigationProp<
        AuthenticationParamsList,
        "AUTHENTICATION_IDP_SELECTION"
      >
    >();

  const isFastLoginFeatureFlagEnabled = useSelector(isFastLoginEnabledSelector);

  const isNativeLoginFeatureFlagEnabled = useSelector(
    isNativeLoginEnabledSelector
  );

  const isNativeLoginEnabled = () =>
    (Platform.OS !== "ios" ||
      (Platform.OS === "ios" && parseInt(Platform.Version, 10) > 13)) &&
    nativeLoginFeature.enabled &&
    isNativeLoginFeatureFlagEnabled;

  const store = useStore();

  const onIdpSelected = (idp: LocalIdpsFallback) => {
    setSelectedIdp(idp);
    handleSendAssistanceLog(choosenTool, `IDP selected: ${idp.id}`);
    void trackLoginSpidIdpSelected(idp.id, store.getState());
    if (isNativeLoginEnabled()) {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_AUTH_SESSION
      });
    } else {
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_LOGIN
      });
    }
  };

  const evokeLoginScreenCounter = () => {
    if (counter < TAPS_TO_OPEN_TESTIDP) {
      const newValue = (counter + 1) % (TAPS_TO_OPEN_TESTIDP + 1);
      setCounter(newValue);
    }
  };

  useEffect(() => {
    requestIdps();
  }, [requestIdps]);

  useEffect(() => {
    if (counter === TAPS_TO_OPEN_TESTIDP) {
      setCounter(0);
      setSelectedIdp(TestIdp);
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_TEST
      });
    }
  }, [counter, setSelectedIdp, navigation]);

  const headerComponent = () => {
    const viewRef = createRef<View>();

    return (
      <>
        {/* Secret login for App Store reviewers */}
        <Pressable accessible={false} onPress={evokeLoginScreenCounter}>
          {/* Add `accessible=false` 'cause it useful only
            for debug mode (stores reviewers).
            Original issue: https://www.pivotaltracker.com/story/show/172082895 */}
          <Banner
            viewRef={viewRef}
            color="neutral"
            size="small"
            content={
              isFastLoginFeatureFlagEnabled
                ? I18n.t("login.expiration_info_FL")
                : I18n.t("login.expiration_info")
            }
            pictogramName="passcode"
          />
        </Pressable>
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
    <SafeAreaView edges={["bottom"]}>
      <ScrollView centerContent={true}>
        <IdpsGridRevamp
          idps={randomIdps}
          onIdpSelected={onIdpSelected}
          headerComponent={headerComponent}
          footerComponent={<VSpacer size={24} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default IdpSelectionScreen;
