import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import { fromNullable, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { NavigationInjectedProps } from "react-navigation";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../i18n";
import BaseScreenComponent, {
  ContextualHelpProps
} from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import View from "../../../components/ui/TextWithIcon";
import {
  getZendeskConfig,
  ZendeskStartPayload,
  zendeskSupportCancel,
  zendeskSupportCompleted
} from "../store/actions";
import ZendeskSupportComponent from "../components/ZendeskSupportComponent";
import { ContextualHelpData } from "../../../components/ContextualHelp/ContextualHelpComponent";
import { getContextualHelpDataFromRouteSelector } from "../../../store/reducers/content";
import { loadContextualHelpData } from "../../../store/actions/content";
import { useIOSelector } from "../../../store/hooks";
import { getFAQsFromCategories } from "../../../utils/faq";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import themeVariables from "../../../theme/variables";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { H3 } from "../../../components/core/typography/H3";
import FAQComponent from "../../../components/FAQComponent";
import {
  getContextualHelpConfig,
  getContextualHelpData,
  reloadContextualHelpDataThreshold
} from "../../../components/screens/BaseScreenComponent/utils";

type FaqManagerProps = Pick<
  ZendeskStartPayload,
  "faqCategories" | "startingRoute"
> & {
  contentLoaded: boolean;
  contextualHelpConfig: ContextualHelpProps | undefined;
};

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
  const maybeContextualData = pot.getOrElse(potContextualData, none);

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

  const defaultData: ContextualHelpData = fromNullable(
    contextualHelpConfig
  ).fold(
    {
      title: "",
      faqs: getFAQsFromCategories(faqCategories ?? []),
      content: constNull
    },
    cHC => ({
      title: cHC.title,
      faqs: getFAQsFromCategories(faqCategories ?? []),
      content: cHC.body()
    })
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
  const isContentLoaded = maybeContextualData.fold(
    contentLoaded,
    _ => contentHasLoaded
  );

  const isContentLoading = contextualHelpData.content === undefined;

  return (
    <>
      {isContentLoading && (
        <View centerJustified={true}>
          <ActivityIndicator color={themeVariables.brandPrimaryLight} />
        </View>
      )}
      {!isContentLoading && (
        <>
          {!isStringNullyOrEmpty(contextualHelpData.title) && (
            <>
              <H3 accessible={true}>{contextualHelpData.title}</H3>
              <View spacer={true} />
            </>
          )}
          {contextualHelpData.content && (
            <>
              {contextualHelpData.content}
              <View spacer={true} />
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

type Props = NavigationInjectedProps<ZendeskStartPayload>;
/**
 * Ingress screen to access the Zendesk assistance tool
 * the user can choose to open a new ticket, follow previous conversations or read the faqs
 * @constructor
 */
const ZendeskSupportHelpCenter = (props: Props) => {
  const dispatch = useDispatch();
  const workUnitCancel = () => dispatch(zendeskSupportCancel());
  const workUnitComplete = () => dispatch(zendeskSupportCompleted());

  // Navigation prop
  const faqCategories = props.navigation.getParam("faqCategories");
  const contextualHelp = props.navigation.getParam("contextualHelp");
  const contextualHelpMarkdown = props.navigation.getParam(
    "contextualHelpMarkdown"
  );
  const startingRoute = props.navigation.getParam("startingRoute");
  const assistanceForPayment = props.navigation.getParam(
    "assistanceForPayment"
  );

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
      showInstabugChat={false}
      customGoBack={<View />}
      customRightIcon={{
        iconName: "io-close",
        onPress: workUnitCancel,
        accessibilityLabel: I18n.t("global.accessibility.contextualHelp.close")
      }}
      headerTitle={I18n.t("support.helpCenter.header")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"ZendeskSupportHelpCenterScreen"}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <FaqManager
            contextualHelpConfig={contextualHelpConfig}
            faqCategories={faqCategories}
            contentLoaded={markdownContentLoaded}
            startingRoute={startingRoute}
          />
          <View spacer />
          <ZendeskSupportComponent
            assistanceForPayment={assistanceForPayment}
          />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ZendeskSupportHelpCenter;
