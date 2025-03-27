import {
  ReactElement,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform, Pressable, View } from "react-native";
import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import _ from "lodash";
import { ContextualHelpPropsMarkdown } from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { idpSelected } from "../../../common/store/actions";
import { idpsRemoteValueSelector } from "../../../../../store/reducers/content";
import { SpidIdp } from "../../../../../../definitions/content/SpidIdp";
import { idps as idpsFallback } from "../../../../../utils/idps";
import { loadIdps } from "../../../../../store/actions/content";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import ROUTES from "../../../../../navigation/routes";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../../../navigation/params/AuthenticationParamsList";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import { nativeLoginSelector } from "../../../nativeLogin/store/reducers";
import { isNativeLoginEnabledSelector } from "../../../nativeLogin/store/selectors";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import IdpsGrid from "../../../../../components/IdpsGrid";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { isReady } from "../../../../../common/model/RemoteValue";
import { trackSpidLoginIdpSelection } from "../../../common/analytics";
import { trackLoginSpidIdpSelected } from "../../../common/analytics/spidAnalytics";

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
  const [counter, setCounter] = useState(0);
  const idps = useIOSelector(idpsRemoteValueSelector);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const nativeLoginFeature = useIOSelector(nativeLoginSelector);
  const isFastLoginFeatureFlagEnabled = useIOSelector(
    isFastLoginEnabledSelector
  );
  const isNativeLoginFeatureFlagEnabled = useIOSelector(
    isNativeLoginEnabledSelector
  );

  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const idpValue = isReady(idps) ? idps.value.items : idpsFallback;
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
    if (!_.isEqual(firstIdpsRef.current, idps.value.items)) {
      // eslint-disable-next-line functional/immutable-data
      randomIdps.current = randomOrderIdps(idps.value.items);
    }
    // eslint-disable-next-line functional/immutable-data
    firstIdpsRef.current = idps.value.items;
  }

  const isNativeLoginEnabled = () =>
    (Platform.OS !== "ios" ||
      (Platform.OS === "ios" && parseInt(Platform.Version, 10) > 13)) &&
    nativeLoginFeature.enabled &&
    isNativeLoginFeatureFlagEnabled;
  const onIdpSelected = (idp: SpidIdp) => {
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

  useOnFirstRender(() => {
    trackSpidLoginIdpSelection();
  });

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
