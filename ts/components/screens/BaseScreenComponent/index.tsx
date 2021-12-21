import { fromNullable, fromPredicate } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import React, {
  ComponentProps,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState
} from "react";
import { ColorValue, ModalBaseProps, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { TranslationKeys } from "../../../../locales/locales";
import {
  defaultAttachmentTypeConfiguration,
  DefaultReportAttachmentTypeConfiguration
} from "../../../boot/configureInstabug";
import { mixpanelTrack } from "../../../mixpanel";
import customVariables from "../../../theme/variables";
import { noAnalyticsRoutes } from "../../../utils/analytics";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { setStatusBarColorAndBackground } from "../../../utils/statusBar";
import ContextualHelp, { RequestAssistancePayload } from "../../ContextualHelp";
import { SearchType } from "../../search/SearchButton";
import { AccessibilityEvents, BaseHeader } from "../BaseHeader";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import { useIOSelector } from "../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import { assistanceToolRemoteConfig } from "../../../utils/supportAssistance";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import {
  getContextualHelpConfig,
  handleOnContextualHelpDismissed,
  handleOnLinkClicked
} from "./utils";

// TODO: remove disabler when instabug is removed
/* eslint-disable sonarjs/cognitive-complexity */
export type ContextualHelpProps = {
  title: string;
  body: () => React.ReactNode;
};

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};

interface OwnProps {
  onAccessibilityNavigationHeaderFocus?: () => void;
  accessibilityEvents?: AccessibilityEvents;
  accessibilityLabel?: string;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  headerBody?: React.ReactNode;
  headerBackgroundColor?: ColorValue;
  appLogo?: boolean;
  searchType?: SearchType;
  reportAttachmentTypes?: DefaultReportAttachmentTypeConfiguration;

  // As of now, the following prop is propagated through 4 levels
  // to finally display a checkbox in SendSupportRequestOptions
  shouldAskForScreenshotWithInitialValue?: boolean;
}

export type Props = PropsWithChildren<
  OwnProps &
    ComponentProps<typeof BaseHeader> &
    Pick<ComponentProps<typeof ContextualHelp>, "faqCategories">
>;

const maybeDark = fromPredicate(
  (isDark: boolean | undefined = undefined) => isDark === true
);

const ANDROID_OPEN_REPORT_DELAY = 50 as Millisecond;

const contextualHelpModalAnimation = Platform.select<
  ModalBaseProps["animationType"]
>({
  ios: "slide",
  default: "none"
});

const BaseScreenComponentFC = React.forwardRef<ReactNode, Props>(
  (props: Props, _) => {
    const {
      accessibilityEvents,
      accessibilityLabel,
      appLogo,
      children,
      contextualHelp,
      contextualHelpMarkdown,
      customGoBack,
      customRightIcon,
      dark,
      faqCategories,
      goBack,
      headerBackgroundColor,
      headerBody,
      headerTitle,
      isSearchAvailable,
      onAccessibilityNavigationHeaderFocus,
      primary,
      reportAttachmentTypes,
      shouldAskForScreenshotWithInitialValue,
      showInstabugChat,
      titleColor
    } = props;

    // We should check for undefined context because the BaseScreen is used also in the Modal layer, without the navigation context.
    const currentScreenName = fromNullable(useNavigationContext())
      .map(x => x.state.routeName)
      .getOrElse("n/a");

    const [isHelpVisible, setIsHelpVisible] = useState(false);
    // if the content is markdown we listen for load end event, otherwise the content is
    // assumed always loaded
    const [markdownContentLoaded, setMarkdownContentLoaded] = useState<boolean>(
      !contextualHelpMarkdown
    );

    // used to trigger the side-effect base on timeout to take the screenshot
    const [requestAssistanceData, setRequestAssistanceData] = useState<{
      payload: RequestAssistancePayload;
      attachmentConfig: DefaultReportAttachmentTypeConfiguration;
    } | null>(null);

    useEffect(() => {
      if (requestAssistanceData) {
        setIsHelpVisible(false);
        // since in Android we have no way to handle Modal onDismiss event https://reactnative.dev/docs/modal#ondismiss
        // we force handling here. The timeout is due to wait until the modal is completely hidden
        // otherwise in the Instabug screenshot we will see the contextual help content instead the screen below
        // TODO: To complete the porting to 0.63.x, both iOS and Android will use the timeout. https://www.pivotaltracker.com/story/show/174195300
        setTimeout(() => {
          handleOnContextualHelpDismissed(
            requestAssistanceData.payload,
            requestAssistanceData.attachmentConfig
          );
          setRequestAssistanceData(null);
        }, ANDROID_OPEN_REPORT_DELAY);
      }
    }, [requestAssistanceData]);

    const showHelp = () => {
      if (!noAnalyticsRoutes.has(currentScreenName)) {
        void mixpanelTrack("OPEN_CONTEXTUAL_HELP", {
          SCREEN_NAME: currentScreenName
        });
      }

      maybeDark(dark).map(_ =>
        setStatusBarColorAndBackground(
          "dark-content",
          customVariables.colorWhite
        )
      );

      setIsHelpVisible(true);
      setMarkdownContentLoaded(!contextualHelpMarkdown);
    };

    const hideHelp = () => {
      maybeDark(dark).map(_ =>
        setStatusBarColorAndBackground(
          "light-content",
          customVariables.brandDarkGray
        )
      );
      setIsHelpVisible(false);
    };

    const handleOnRequestAssistance = (payload: RequestAssistancePayload) => {
      // if reportAttachmentTypes is undefined use the default attachment config
      const attachmentConfig: DefaultReportAttachmentTypeConfiguration = {
        ...(reportAttachmentTypes ?? defaultAttachmentTypeConfiguration),
        screenshot: payload.shouldSendScreenshot ?? true
      };
      if (payload.supportType === BugReporting.reportType.bug) {
        setRequestAssistanceData({ payload, attachmentConfig });
      } else {
        // don't close modal if the report isn't a bug (bug brings a screenshot)
        handleOnContextualHelpDismissed(payload, attachmentConfig);
      }
    };

    const contextualHelpConfig = getContextualHelpConfig(
      contextualHelp,
      contextualHelpMarkdown,
      () => setMarkdownContentLoaded(true),
      handleOnLinkClicked(hideHelp)
    );
    const dispatch = useDispatch();
    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const canShowHelp = useIOSelector(canShowHelpSelector);

    const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

    const onShowHelp = (): (() => void) | undefined => {
      switch (choosenTool) {
        case ToolEnum.zendesk:
          // TODO: remove local feature flag
          // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
          return () => {
            dispatch(
              zendeskSupportStart({
                faqCategories,
                contextualHelp,
                contextualHelpMarkdown,
                startingRoute: currentScreenName,
                assistanceForPayment: false
              })
            );
          };
        case ToolEnum.instabug:
          // TODO: remove instabug
          return () => showHelp();
        case ToolEnum.none:
        case ToolEnum.web:
          return undefined;
        default:
          return undefined;
      }
    };

    // help button can be shown only when remote FF is instabug or (zendesk + ff local) and the contextualHelpConfig is defined
    const canShowHelpButton: boolean =
      canShowHelp && contextualHelpConfig !== undefined;
    return (
      <Container>
        <BaseHeader
          onAccessibilityNavigationHeaderFocus={
            onAccessibilityNavigationHeaderFocus
          }
          accessibilityEvents={accessibilityEvents}
          accessibilityLabel={accessibilityLabel}
          showInstabugChat={showInstabugChat}
          primary={primary}
          dark={dark}
          goBack={goBack}
          headerTitle={headerTitle}
          backgroundColor={headerBackgroundColor}
          onShowHelp={canShowHelpButton ? onShowHelp() : undefined}
          isSearchAvailable={isSearchAvailable}
          body={headerBody}
          appLogo={appLogo}
          customRightIcon={customRightIcon}
          customGoBack={customGoBack}
          titleColor={titleColor}
        />
        {children}
        {contextualHelpConfig && (
          <ContextualHelp
            shouldAskForScreenshotWithInitialValue={
              shouldAskForScreenshotWithInitialValue
            }
            title={contextualHelpConfig.title}
            onLinkClicked={handleOnLinkClicked(hideHelp)}
            body={contextualHelpConfig.body}
            isVisible={isHelpVisible}
            modalAnimation={contextualHelpModalAnimation}
            onRequestAssistance={handleOnRequestAssistance}
            close={hideHelp}
            contentLoaded={markdownContentLoaded}
            faqCategories={faqCategories}
          />
        )}
      </Container>
    );
  }
);

export default connectStyle(
  "UIComponent.BaseScreenComponent",
  {},
  mapPropsToStyleNames
)(BaseScreenComponentFC);
