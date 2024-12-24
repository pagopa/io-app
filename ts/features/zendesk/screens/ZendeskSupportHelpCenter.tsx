import {
  AccordionItem,
  Body,
  ButtonLink,
  ContentWrapper,
  FeatureInfo,
  FooterActions,
  H4,
  H6,
  HeaderSecondLevel,
  IOToast,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import _ from "lodash";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import IOMarkdown from "../../../components/IOMarkdown";
import { ContextualHelpProps } from "../../../components/screens/BaseScreenComponent";
import {
  getContextualHelpConfig,
  getContextualHelpData,
  reloadContextualHelpDataThreshold
} from "../../../components/screens/BaseScreenComponent/utils";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../components/ui/IOScrollView";
import { zendeskPrivacyUrl } from "../../../config";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { loadContextualHelpData } from "../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getContextualHelpDataFromRouteSelector } from "../../../store/reducers/content";
import {
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../../store/reducers/profile";
import { FAQType, getFAQsFromCategories } from "../../../utils/faq";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import {
  addTicketCustomField,
  zendeskFciId
} from "../../../utils/supportAssistance";
import { openWebUrl } from "../../../utils/url";
import { fciSignatureRequestIdSelector } from "../../fci/store/reducers/fciSignatureRequest";
import { ZendeskParamsList } from "../navigation/params";
import ZENDESK_ROUTES from "../navigation/routes";
import {
  ZendeskStartPayload,
  getZendeskConfig,
  getZendeskPaymentConfig,
  getZendeskToken,
  zendeskSupportCancel
} from "../store/actions";
import {
  getZendeskTokenStatusSelector,
  zendeskConfigSelector,
  ZendeskTokenStatusEnum
} from "../store/reducers";
import { handleContactSupport } from "../utils";
import { usePrevious } from "../../../utils/hooks/usePrevious";
import { isLoggedIn } from "../../../store/reducers/authentication";

type FaqManagerProps = Pick<
  ZendeskStartPayload,
  "faqCategories" | "startingRoute"
> & {
  contentLoaded?: boolean;
  contextualHelpConfig: ContextualHelpProps | undefined;
};

export type ContextualHelpData = {
  title: string;
  content: string;
  faqs?: ReadonlyArray<FAQType>;
};

export type ZendeskSupportHelpCenterNavigationParams = ZendeskStartPayload;

enum ButtonPressedEnum {
  ON_GOING_REQUEST = "ON_GOING_REQUEST",
  OPEN_NEW_REQUEST = "OPEN_NEW_REQUEST"
}
/**
 * This component must be used only here.
 * Make the {@link ZendeskSupportHelpCenter} compatible with {@link HeaderSecondLevel} and substitute the {@link ContextualHelp}
 * It show the title and the FAQ of the contextual help.
 * @constructor
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
      title={item.title}
      body={<IOMarkdown content={item.content} />}
    />
  );

  return (
    <>
      {!isStringNullyOrEmpty(contextualHelpData.title) && (
        <>
          <H4 color={theme["textHeading-default"]} accessible={true}>
            {contextualHelpData.title}
          </H4>
        </>
      )}
      {contextualHelpData.content && (
        <>
          <VSpacer size={16} />
          <IOMarkdown content={contextualHelpData.content} />
          <VSpacer size={16} />
        </>
      )}
      {contextualHelpData.faqs && (
        <FlatList
          ListHeaderComponent={<VSpacer size={8} />}
          scrollEnabled={false}
          data={contextualHelpData.faqs}
          keyExtractor={c => c.title}
          renderItem={renderFaqItem}
          ItemSeparatorComponent={() => <VSpacer size={8} />}
          ListFooterComponent={<VSpacer size={8} />}
        />
      )}
    </>
  );
};

/**
 * Ingress screen to access the Zendesk assistance tool
 * the user can choose to open a new ticket, follow previous conversations or read the faqs
 * @constructor
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
    assistanceForPayment,
    assistanceForCard,
    assistanceForFci
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
        params: {
          assistanceForPayment,
          assistanceForCard,
          assistanceForFci
        }
      });
    } else {
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS,
        params: {
          assistanceForPayment,
          assistanceForCard,
          assistanceForFci
        }
      });
    }
  }, [
    assistanceForCard,
    assistanceForFci,
    assistanceForPayment,
    maybeProfile,
    navigation
  ]);

  const handleContactSupportPress = useCallback(
    () =>
      handleContactSupport(
        navigation,
        assistanceForPayment,
        assistanceForCard,
        assistanceForFci,
        zendeskRemoteConfig
      ),
    [
      navigation,
      assistanceForPayment,
      assistanceForCard,
      assistanceForFci,
      zendeskRemoteConfig
    ]
  );

  const handleButtonPress = React.useCallback(
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
        onPress: () => handleButtonPress(ButtonPressedEnum.OPEN_NEW_REQUEST),
        loading:
          getZendeskTokenStatus === "request" &&
          pressedButton === ButtonPressedEnum.OPEN_NEW_REQUEST
      },
      secondary: {
        testID: "showTicketsButton",
        label: I18n.t("support.helpCenter.cta.seeReports"),
        onPress: () => handleButtonPress(ButtonPressedEnum.ON_GOING_REQUEST)
      }
    }),
    [getZendeskTokenStatus, handleButtonPress, pressedButton]
  );

  /**
   * as first step request the config (categories + panicmode) that could
     be used in the next steps (possible network error are handled in {@link ZendeskAskPermissions})
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
          ignoreSafeAreaMargin={true}
          title={I18n.t("support.helpCenter.header")}
          transparent={false}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.close"
            ),
            onPress: workUnitCancel
          }}
          enableDiscreteTransition={true}
          animatedRef={animatedScrollViewRef}
        />
      )
    });
  });

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      testID={"ZendeskSupportHelpCenterScreen"}
      includeContentMargins={false}
      excludeEndContentMargin={showRequestSupportContacts}
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
            <H6>{I18n.t("support.helpCenter.supportComponent.title")}</H6>
            <VSpacer size={8} />
            <Body>
              {I18n.t("support.helpCenter.supportComponent.subtitle")}
            </Body>
            <VSpacer size={16} />
            <ButtonLink
              label={I18n.t("support.askPermissions.privacyLink")}
              onPress={() => {
                openWebUrl(zendeskPrivacyUrl, () =>
                  IOToast.error(I18n.t("global.jserror.title"))
                );
              }}
            />
            <VSpacer size={24} />
            <FeatureInfo
              iconName="notice"
              body={I18n.t("support.helpCenter.supportComponent.adviceMessage")}
            />
          </>
        )}
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={showRequestSupportContacts ? footerActions : undefined}
      />
    </IOScrollView>
  );
};

export default ZendeskSupportHelpCenter;
