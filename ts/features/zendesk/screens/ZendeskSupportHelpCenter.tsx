import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H3 } from "../../../components/core/typography/H3";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FAQComponent from "../../../components/FAQComponent";
import BaseScreenComponent, {
  ContextualHelpProps
} from "../../../components/screens/BaseScreenComponent";
import {
  getContextualHelpConfig,
  getContextualHelpData,
  reloadContextualHelpDataThreshold
} from "../../../components/screens/BaseScreenComponent/utils";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import I18n from "../../../i18n";
import { loadContextualHelpData } from "../../../store/actions/content";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getContextualHelpDataFromRouteSelector } from "../../../store/reducers/content";
import { FAQType, getFAQsFromCategories } from "../../../utils/faq";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import ZendeskSupportComponent from "../components/ZendeskSupportComponent";
import { ZendeskParamsList } from "../navigation/params";
import {
  getZendeskConfig,
  ZendeskStartPayload,
  zendeskSupportCancel,
  zendeskSupportCompleted
} from "../store/actions";

type FaqManagerProps = Pick<
  ZendeskStartPayload,
  "faqCategories" | "startingRoute"
> & {
  contentLoaded: boolean;
  contextualHelpConfig: ContextualHelpProps | undefined;
};

export type ContextualHelpData = {
  title: string;
  content: React.ReactNode;
  faqs?: ReadonlyArray<FAQType>;
};

export type ZendeskSupportHelpCenterNavigationParams = ZendeskStartPayload;

/**
 * This component must be used only here.
 * Make the {@link ZendeskSupportHelpCenter} compatible with {@link BaseScreenComponent} and substitute the {@link ContextualHelp}
 * It show the title and the FAQ of the contextual help.
 * @constructor
 */
const FaqManager = (props: FaqManagerProps) => {
  const dispatch = useDispatch();
  const workUnitComplete = () => dispatch(zendeskSupportCompleted());
  const potContextualData = useIOSelector(
    getContextualHelpDataFromRouteSelector(props.startingRoute)
  );
  const maybeContextualData = pot.getOrElse(potContextualData, O.none);

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
        content: constNull
      }),
      cHC => ({
        title: cHC.title,
        faqs: getFAQsFromCategories(faqCategories ?? []),
        content: cHC.body()
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

  return (
    <>
      {isContentLoading && (
        <View style={[IOStyles.flex, IOStyles.centerJustified]}>
          <ActivityIndicator color={IOColors.blueUltraLight} />
        </View>
      )}
      {!isContentLoading && (
        <>
          {!isStringNullyOrEmpty(contextualHelpData.title) && (
            <>
              <H3 accessible={true}>{contextualHelpData.title}</H3>
              <VSpacer size={16} />
            </>
          )}
          {contextualHelpData.content && (
            <>
              {contextualHelpData.content}
              <VSpacer size={16} />
            </>
          )}
          {contextualHelpData.faqs && isContentLoaded && (
            <FAQComponent
              shouldHandleLink={_ => {
                // when a link is clicked in the faq, terminate the workunit before the link will be handled (i.e: internal or external navigation)
                workUnitComplete();
                return true;
              }}
              faqs={contextualHelpData.faqs}
            />
          )}
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

  const route = useRoute<RouteProp<ZendeskParamsList, "ZENDESK_HELP_CENTER">>();

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

  const [markdownContentLoaded, setMarkdownContentLoaded] = useState<boolean>(
    !contextualHelpMarkdown
  );

  const contextualHelpConfig = getContextualHelpConfig(
    contextualHelp,
    contextualHelpMarkdown,
    () => setMarkdownContentLoaded(true),
    constNull,
    _ => {
      // when a link is clicked in the contextual help, terminate the workunit before the link will be handled (i.e: internal or external navigation)
      workUnitComplete();
      return true;
    }
  );

  /**
   * as first step request the config (categories + panicmode) that could
     be used in the next steps (possible network error are handled in {@link ZendeskAskPermissions})
   */
  useEffect(() => {
    dispatch(getZendeskConfig.request());
  }, [dispatch]);

  return (
    <BaseScreenComponent
      showChat={false}
      customGoBack={<View />}
      customRightIcon={{
        iconName: "close",
        onPress: workUnitCancel,
        accessibilityLabel: I18n.t("global.accessibility.contextualHelp.close")
      }}
      headerTitle={I18n.t("support.helpCenter.header")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"ZendeskSupportHelpCenterScreen"}
      >
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <FaqManager
            contextualHelpConfig={contextualHelpConfig}
            faqCategories={faqCategories}
            contentLoaded={markdownContentLoaded}
            startingRoute={startingRoute}
          />
          <VSpacer size={16} />
          <ZendeskSupportComponent
            assistanceForPayment={assistanceForPayment}
            assistanceForCard={assistanceForCard}
            assistanceForFci={assistanceForFci}
          />
          <VSpacer size={16} />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskSupportHelpCenter;
