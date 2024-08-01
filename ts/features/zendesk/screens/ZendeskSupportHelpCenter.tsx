import {
  AccordionItem,
  Body,
  ButtonLink,
  ContentWrapper,
  FeatureInfo,
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
import { constNull, pipe } from "fp-ts/lib/function";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, ListRenderItemInfo, ScrollView } from "react-native";
import { ContextualHelpProps } from "../../../components/screens/BaseScreenComponent";
import {
  getContextualHelpConfig,
  getContextualHelpData,
  reloadContextualHelpDataThreshold
} from "../../../components/screens/BaseScreenComponent/utils";
import { zendeskPrivacyUrl } from "../../../config";
import { useFooterActionsMeasurements } from "../../../hooks/useFooterActionsMeasurements";
import I18n from "../../../i18n";
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
import ItwMarkdown from "../../itwallet/common/components/ItwMarkdown";
import ZendeskSupportActions from "../components/ZendeskSupportActions";
import { ZendeskParamsList } from "../navigation/params";
import {
  ZendeskStartPayload,
  getZendeskConfig,
  zendeskSupportCancel,
  zendeskSupportCompleted
} from "../store/actions";

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

/**
 * This component must be used only here.
 * Make the {@link ZendeskSupportHelpCenter} compatible with {@link HeaderSecondLevel} and substitute the {@link ContextualHelp}
 * It show the title and the FAQ of the contextual help.
 * @constructor
 */
const FaqManager = (props: FaqManagerProps) => {
  const dispatch = useIODispatch();
  const workUnitComplete = () => dispatch(zendeskSupportCompleted());
  const potContextualData = useIOSelector(
    getContextualHelpDataFromRouteSelector(props.startingRoute)
  );
  const maybeContextualData = pot.getOrElse(potContextualData, O.none);

  const theme = useIOTheme();

  const [contentHasLoaded, setContentHasLoaded] = useState<boolean | undefined>(
    undefined
  );

  const [lastContextualDataUpdate, setLastContextualDataUpdate] =
    useState<Date>(new Date());
  const { contextualHelpConfig, faqCategories, contentLoaded } = props;
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
        content: null
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
    defaultData,
    () => setContentHasLoaded(true)
  );
  /**
   content is loaded when:
   - provided one from props is loaded or
   - when the remote one is loaded
   */
  const isContentLoaded = pipe(
    maybeContextualData,
    O.fold(
      () => contentLoaded,
      _ => contentHasLoaded
    )
  );

  const isContentLoading = contextualHelpData.content === undefined;

  const renderFaqItem = ({ item }: ListRenderItemInfo<FAQType>) => (
    <AccordionItem
      title={item.title}
      body={item.content}
      // onLinkClicked={props.onLinkClicked}
      // shouldHandleLink={props.shouldHandleLink}
    />
  );

  return (
    <>
      {/* {isContentLoading && (
        <View style={[IOStyles.flex, IOStyles.centerJustified]}>
          <ActivityIndicator color={IOColors.blueUltraLight} />
        </View>
      )} */}
      {!isContentLoading && (
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
              <ItwMarkdown content={contextualHelpData.content} />
              <VSpacer size={16} />
            </>
          )}
          {contextualHelpData.faqs && isContentLoaded && (
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
          {/* <FAQComponent
                shouldHandleLink={_ => {
                  // when a link is clicked in the faq, terminate the workunit before the link will be handled (i.e: internal or external navigation)
                  workUnitComplete();
                  return true;
                }}
                faqs={contextualHelpData.faqs}
              /> */}
        </>
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
  const dispatch = useIODispatch();
  const workUnitCancel = () => dispatch(zendeskSupportCancel());
  const workUnitComplete = () => dispatch(zendeskSupportCompleted());
  const profile = useIOSelector(profileSelector);
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const showRequestSupportContacts = isEmailValidated || !pot.isSome(profile);

  const route = useRoute<RouteProp<ZendeskParamsList, "ZENDESK_HELP_CENTER">>();

  const navigation = useNavigation();
  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  // Navigation prop
  const {
    faqCategories,
    contextualHelp,
    contextualHelpMarkdown,
    startingRoute,
    assistanceForPayment,
    assistanceForCard,
    assistanceForFci
  } = route.params;

  // const [markdownContentLoaded, setMarkdownContentLoaded] = useState<boolean>(
  //   !contextualHelpMarkdown
  // );

  const contextualHelpConfig = getContextualHelpConfig(
    contextualHelp,
    contextualHelpMarkdown
    // () => setMarkdownContentLoaded(true),
    // constNull,
    // _ => {
    //   // when a link is clicked in the contextual help, terminate the workunit before the link will be handled (i.e: internal or external navigation)
    //   workUnitComplete();
    //   return true;
    // }
  );

  /**
   * as first step request the config (categories + panicmode) that could
     be used in the next steps (possible network error are handled in {@link ZendeskAskPermissions})
   */
  useEffect(() => {
    dispatch(getZendeskConfig.request());
  }, [dispatch]);

  // add the signatureRequestId to the ticket custom fields
  // this is needed to allow the user to see the ticket in the zendesk portal
  // this is the case of a user that has opened a ticket from the siggning flow
  if (signatureRequestId !== undefined) {
    addTicketCustomField(zendeskFciId, signatureRequestId ?? "");
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderSecondLevel
          type="singleAction"
          title={I18n.t("support.helpCenter.header")}
          firstAction={{
            icon: "closeLarge",
            onPress: workUnitCancel,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.close"
            )
          }}
        />
      )
    });
  });

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
        testID={"ZendeskSupportHelpCenterScreen"}
      >
        <ContentWrapper>
          <FaqManager
            contextualHelpConfig={contextualHelpConfig}
            faqCategories={faqCategories}
            // contentLoaded={markdownContentLoaded}
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
                body={I18n.t(
                  "support.helpCenter.supportComponent.adviceMessage"
                )}
              />
            </>
          )}
        </ContentWrapper>
      </ScrollView>
      {showRequestSupportContacts && (
        <ZendeskSupportActions
          onMeasure={handleFooterActionsMeasurements}
          assistanceForPayment={assistanceForPayment}
          assistanceForCard={assistanceForCard}
          assistanceForFci={
            assistanceForFci || signatureRequestId !== undefined
          }
        />
      )}
    </>
  );
};

export default ZendeskSupportHelpCenter;
