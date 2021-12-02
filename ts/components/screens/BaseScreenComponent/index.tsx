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
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import customVariables from "../../../theme/variables";
import { noAnalyticsRoutes } from "../../../utils/analytics";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { setStatusBarColorAndBackground } from "../../../utils/statusBar";
import ContextualHelp, { RequestAssistancePayload } from "../../ContextualHelp";
import { SearchType } from "../../search/SearchButton";
import Markdown from "../../ui/Markdown";
import { AccessibilityEvents, BaseHeader } from "../BaseHeader";

import { zendeskEnabled } from "../../../config";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import { handleOnContextualHelpDismissed, handleOnLinkClicked } from "./utils";

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
        // otherwise in the Instabug screeshot we will see the contextual help content instead the screen below
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

    const contextualHelpConfig = contextualHelp
      ? { body: contextualHelp.body, title: contextualHelp.title }
      : contextualHelpMarkdown
      ? {
          body: () => (
            <Markdown
              onLinkClicked={handleOnLinkClicked(hideHelp)}
              onLoadEnd={() => {
                setMarkdownContentLoaded(true);
              }}
            >
              {I18n.t(contextualHelpMarkdown.body)}
            </Markdown>
          ),
          title: I18n.t(contextualHelpMarkdown.title)
        }
      : undefined;
    const dispatch = useDispatch();
    const onShowHelp = () => {
      // TODO: Add remote FF
      // TODO: remove instabug
      if (zendeskEnabled) {
        dispatch(zendeskSupportStart());
      } else {
        showHelp();
      }
    };
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
          onShowHelp={contextualHelpConfig ? onShowHelp : undefined}
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
