import {
  AccordionItem,
  Banner,
  ContentWrapper,
  FooterActions,
  H4,
  HeaderSecondLevel,
  IOMarkdownLite,
  IOToast,
  ListItemInfo,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import _ from "lodash";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import { InitializedProfile } from "../../../../definitions/identity/InitializedProfile";
import IOMarkdown from "../../../components/IOMarkdown";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../components/ui/IOScrollView";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { loadContextualHelpData } from "../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  caCBannerConfigSelector,
  isCaCBannerEnabledSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { getContextualHelpDataFromRouteSelector } from "../../../store/reducers/content";
import {
  ContextualHelpProps,
  getContextualHelpConfig,
  getContextualHelpData,
  reloadContextualHelpDataThreshold
} from "../../../utils/contextualHelp";
import { FAQType, getFAQsFromCategories } from "../../../utils/faq";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../../utils/hooks/usePrevious";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../utils/locale";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import {
  addTicketCustomField,
  zendeskFciId
} from "../../../utils/supportAssistance";
import { openWebUrl } from "../../../utils/url";
import { isLoggedIn } from "../../authentication/common/store/utils/guards";
import { fciSignatureRequestIdSelector } from "../../fci/store/reducers/fciSignatureRequest";
import {
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../settings/common/store/selectors";
import {
  trackZendeskCaCBannerShow,
  trackZendeskCaCBannerTap
} from "../analytics";
import { ZendeskParamsList } from "../navigation/params";
import ZENDESK_ROUTES from "../navigation/routes";
import {
  getZendeskConfig,
  getZendeskPaymentConfig,
  getZendeskToken,
  ZendeskStartPayload,
  zendeskSupportCancel
} from "../store/actions";
import {
  getZendeskTokenStatusSelector,
  zendeskConfigSelector,
  ZendeskTokenStatusEnum
} from "../store/reducers";
import { handleContactSupport } from "../utils";

enum ButtonPressedEnum {
  ON_GOING_REQUEST = "ON_GOING_REQUEST",
  OPEN_NEW_REQUEST = "OPEN_NEW_REQUEST"
}

export type ContextualHelpData = {
  content: string;
  faqs?: ReadonlyArray<FAQType>;
  title: string;
};

export type ZendeskSupportHelpCenterNavigationParams = ZendeskStartPayload;

type FaqManagerProps = Pick<
  ZendeskStartPayload,
  "faqCategories" | "startingRoute"
> & {
  contentLoaded?: boolean;
  contextualHelpConfig: ContextualHelpProps | undefined;
};
/**
 * This component must be used only here. Make the
 * {@link ZendeskSupportHelpCenter} compatible with {@link HeaderSecondLevel} and
 * substitute the {@link ContextualHelp} It show the title and the FAQ of the
 * contextual help.
 *
 * @class
 */
const FaqManager = (props: FaqManagerProps) => {
  const dispatch = useIODispatch();
  // const workUnitComplete = () => dispatch(zendeskSupportCompleted());
  const potContextualData = useIOSelector(
    getContextualHelpDataFromRouteSelector(props.startingRoute)
  );
  const maybeContextualData = pot.getOrElse(potContextualData, O.none);

  const theme = useIOTheme();

  const [lastContextualDataUpdate, setLastContextualDataUpdate] =
    useState<Date>(new Date());
  const { contextualHelpConfig, faqCategories } = props;
  useEffect(() => {
    const now = new Date();
    // if the contextual data is empty or is in error and last reload was done before the threshold -> try to reload
    if (
      now.getTime() - lastContextualDataUpdate.getTime() >
        reloadContextualHelpDataThreshold &&
      !pot.isLoading(potContextualData) &&
      pot.isNone(potContextualData)
    ) {
      setLastContextualDataUpdate(now);
      dispatch(loadContextualHelpData.request());
    }
  }, [dispatch, lastContextualDataUpdate, potContextualData]);

  const defaultData: ContextualHelpData = pipe(
    contextualHelpConfig,
    O.fromNullable,
    O.fold(
      () => ({
        title: "",
        faqs: getFAQsFromCategories(faqCategories ?? []),
        content: ""
      }),
      cHC => ({
        title: cHC.title,
        faqs: getFAQsFromCategories(faqCategories ?? []),
        content: cHC.body
      })
    )
  );
  const contextualHelpData: ContextualHelpData = getContextualHelpData(
    maybeContextualData,
    defaultData
  );

  const renderFaqItem = ({ item }: ListRenderItemInfo<FAQType>) => (
    <AccordionItem
      body={<IOMarkdown content={item.content} />}
      title={item.title}
    />
  );

  const isCacBannerEnabled = useIOSelector(isCaCBannerEnabledSelector);
  const bannerCaCConfig = useIOSelector(caCBannerConfigSelector);
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  useOnFirstRender(() => {
    if (isCacBannerEnabled && bannerCaCConfig && bannerCaCConfig.action) {
      trackZendeskCaCBannerShow(bannerCaCConfig.action.url?.[localeFallback]);
    }
  });

  const handleBannerPress = () => {
    if (!bannerCaCConfig?.action) {
      return;
    }

    trackZendeskCaCBannerTap(bannerCaCConfig.action.url?.[localeFallback]);

    return openWebUrl(bannerCaCConfig.action.url?.[localeFallback], () =>
      IOToast.error(I18n.t("global.jserror.title"))
    );
  };

  return (
    <>
      {!isStringNullyOrEmpty(contextualHelpData.title) && (
        <H4 accessible={true} color={theme["textHeading-default"]}>
          {contextualHelpData.title}
        </H4>
      )}
      {contextualHelpData.content && (
        <>
          <VSpacer size={16} />
          <IOMarkdown content={contextualHelpData.content} />
        </>
      )}
      <VSpacer size={16} />
      {isCacBannerEnabled && (
        <Banner
          action={bannerCaCConfig?.action?.label?.[localeFallback] ?? ""}
          color="neutral"
          content={bannerCaCConfig?.description?.[localeFallback]}
          onPress={handleBannerPress}
          pictogramName="help"
          title={bannerCaCConfig?.title?.[localeFallback]}
        />
      )}
      <VSpacer size={16} />
      {contextualHelpData.faqs && (
        <FlatList
          data={contextualHelpData.faqs}
          ItemSeparatorComponent={() => <VSpacer size={8} />}
          keyExtractor={c => c.title}
          ListFooterComponent={<VSpacer size={8} />}
          ListHeaderComponent={<VSpacer size={8} />}
          renderItem={renderFaqItem}
          scrollEnabled={false}
        />
      )}
    </>
  );
};

/**
 * Ingress screen to access the Zendesk assistance tool the user can choose to
 * open a new ticket, follow previous conversations or read the faqs
 *
 * @class
 */
const ZendeskSupportHelpCenter = () => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const dispatch = useIODispatch();
  const workUnitCancel = () => dispatch(zendeskSupportCancel());
  // const workUnitComplete = () => dispatch(zendeskSupportCompleted());
  const profile = useIOSelector(profileSelector, _.isEqual);
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);
  const isEmailValidated = useIOSelector(
    isProfileEmailValidatedSelector,
    _.isEqual
  );
  const showRequestSupportContacts = isEmailValidated || !pot.isSome(profile);

  const isUserLoggedIn = useIOSelector(s => isLoggedIn(s.authentication));
  const getZendeskTokenStatus = useIOSelector(getZendeskTokenStatusSelector);
  const prevGetZendeskTokenStatus = usePrevious(getZendeskTokenStatus);

  // Check for Actions to be displayed
  const maybeProfile: O.Option<InitializedProfile> = pot.toOption(profile);
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const route = useRoute<RouteProp<ZendeskParamsList, "ZENDESK_HELP_CENTER">>();
  const [pressedButton, setPressedButton] = useState<ButtonPressedEnum>();
  // Navigation prop
  const {
    faqCategories,
    contextualHelp,
    contextualHelpMarkdown,
    startingRoute,
    assistanceType
  } = route.params || {};
  //   !contextualHelpMarkdown
  // );

  const contextualHelpConfig = getContextualHelpConfig(
    contextualHelp,
    contextualHelpMarkdown
  );

  /*
  Check for Actions
  */

  const handleOnGoingRequest = useCallback(() => {
    void mixpanelTrack("ZENDESK_SHOW_TICKETS_STARTS");
    if (O.isNone(maybeProfile)) {
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.SEE_REPORTS_ROUTERS,
        params: { assistanceType }
      });
    } else {
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS,
        params: { assistanceType }
      });
    }
  }, [assistanceType, maybeProfile, navigation]);

  const handleContactSupportPress = useCallback(
    () => handleContactSupport(navigation, assistanceType, zendeskRemoteConfig),
    [navigation, assistanceType, zendeskRemoteConfig]
  );

  const handleButtonPress = useCallback(
    (value: ButtonPressedEnum) => {
      setPressedButton(value);
      if (isUserLoggedIn) {
        // dispatching this action invokes the saga that performs
        // the getSession and retrieves the Zendesk token from the BE
        dispatch(getZendeskToken.request());
      } else {
        if (value === ButtonPressedEnum.ON_GOING_REQUEST) {
          handleOnGoingRequest();
        } else if (value === ButtonPressedEnum.OPEN_NEW_REQUEST) {
          handleContactSupportPress();
        }
      }
    },
    [dispatch, handleOnGoingRequest, handleContactSupportPress, isUserLoggedIn]
  );

  const footerActions: IOScrollViewActions = useMemo(
    () => ({
      type: "TwoButtons",
      primary: {
        testID: "contactSupportButton",
        label: I18n.t("support.helpCenter.cta.contactSupport"),
        icon: "chat",
        onPress: () => handleButtonPress(ButtonPressedEnum.OPEN_NEW_REQUEST),
        loading:
          getZendeskTokenStatus === "request" &&
          pressedButton === ButtonPressedEnum.OPEN_NEW_REQUEST
      },
      secondary: {
        icon: "inbox",
        testID: "showTicketsButton",
        label: I18n.t("support.helpCenter.cta.seeReports"),
        onPress: () => handleButtonPress(ButtonPressedEnum.ON_GOING_REQUEST)
      }
    }),
    [getZendeskTokenStatus, handleButtonPress, pressedButton]
  );

  /**
   * As first step request the config (categories + panicmode) that could be
   * used in the next steps (possible network error are handled in
   * {@link ZendeskAskPermissions})
   */
  useEffect(() => {
    dispatch(getZendeskConfig.request());
    dispatch(getZendeskPaymentConfig.request());
  }, [dispatch]);

  // add the signatureRequestId to the ticket custom fields
  // this is needed to allow the user to see the ticket in the zendesk portal
  // this is the case of a user that has opened a ticket from the siggning flow
  if (signatureRequestId !== undefined) {
    addTicketCustomField(zendeskFciId, signatureRequestId ?? "");
  }

  // This useEffect handles the response of the getSession and allows the request to be handled.
  useEffect(() => {
    if (
      prevGetZendeskTokenStatus === ZendeskTokenStatusEnum.REQUEST &&
      getZendeskTokenStatus === ZendeskTokenStatusEnum.SUCCESS
    ) {
      if (pressedButton === ButtonPressedEnum.ON_GOING_REQUEST) {
        handleOnGoingRequest();
      } else if (pressedButton === ButtonPressedEnum.OPEN_NEW_REQUEST) {
        handleContactSupportPress();
      }
    } else if (
      prevGetZendeskTokenStatus === ZendeskTokenStatusEnum.REQUEST &&
      getZendeskTokenStatus === ZendeskTokenStatusEnum.ERROR
    ) {
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.ERROR_REQUEST_ZENDESK_TOKEN
      });
    }
  }, [
    getZendeskTokenStatus,
    handleContactSupportPress,
    handleOnGoingRequest,
    navigation,
    pressedButton,
    prevGetZendeskTokenStatus
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          animatedRef={animatedScrollViewRef}
          enableDiscreteTransition={true}
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.close"
            ),
            onPress: workUnitCancel
          }}
          /* Avoid status bar overlapping on Android */
          ignoreSafeAreaMargin={Platform.OS === "ios" ? true : false}
          title={I18n.t("support.helpCenter.header")}
          transparent={false}
          type="singleAction"
        />
      )
    });
  });

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      excludeEndContentMargin={showRequestSupportContacts}
      includeContentMargins={false}
      testID={"ZendeskSupportHelpCenterScreen"}
    >
      <ContentWrapper>
        <FaqManager
          contextualHelpConfig={contextualHelpConfig}
          faqCategories={faqCategories}
          startingRoute={startingRoute}
        />

        {showRequestSupportContacts && (
          <>
            <VSpacer size={24} />
            <H4>{I18n.t("support.helpCenter.supportComponent.title")}</H4>
            <VSpacer size={8} />
            <ListItemInfo
              icon="email"
              numberOfLines={5}
              value={
                <IOMarkdownLite
                  content={I18n.t(
                    "support.helpCenter.supportComponent.messageProblem"
                  )}
                />
              }
            />
            <ListItemInfo
              icon="chat"
              numberOfLines={3}
              value={
                <IOMarkdownLite
                  content={I18n.t(
                    "support.helpCenter.supportComponent.appProblem"
                  )}
                />
              }
            />
            <ListItemInfo
              icon="inbox"
              numberOfLines={2}
              value={
                <IOMarkdownLite
                  content={I18n.t(
                    "support.helpCenter.supportComponent.checkRequests"
                  )}
                />
              }
            />
          </>
        )}
      </ContentWrapper>
      <FooterActions
        actions={showRequestSupportContacts ? footerActions : undefined}
        fixed={false}
      />
    </IOScrollView>
  );
};

export default ZendeskSupportHelpCenter;
