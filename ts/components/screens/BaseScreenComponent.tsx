import {
  fromNullable,
  fromPredicate,
  none,
  Option,
  some
} from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { ComponentProps } from "react";
import { ColorValue, ModalBaseProps, Platform } from "react-native";
import { isTestEnv } from "../../utils/environment";
import { TranslationKeys } from "../../../locales/locales";
import {
  DefaultReportAttachmentTypeConfiguration,
  TypeLogs,
  defaultAttachmentTypeConfiguration,
  instabugLog,
  openInstabugQuestionReport,
  openInstabugReplies,
  setInstabugDeviceIdAttribute,
  setInstabugSupportTokenAttribute
} from "../../boot/configureInstabug";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { handleItemOnPress } from "../../utils/url";
import ContextualHelpModal, {
  RequestAssistancePayload
} from "../ContextualHelp/ContextualHelpModal";
import { SearchType } from "../search/SearchButton";
import Markdown from "../ui/Markdown";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../ui/Markdown/handlers/link";
import { getValueOrElse } from "../../features/bonus/bpd/model/RemoteValue";
import { AccessibilityEvents, BaseHeader } from "./BaseHeader";

/**
 * Run side-effects from the Instabug library based on the type of support.
 */
function handleOnContextualHelpDismissed(
  payload: RequestAssistancePayload,
  attachmentConfig: DefaultReportAttachmentTypeConfiguration
): void {
  const maybeSupportToken = getValueOrElse(payload.supportToken, undefined);
  const { supportType } = payload;

  switch (supportType) {
    case BugReporting.reportType.bug: {
      // Store/remove and log the support token only if is a new assistance request.
      // log on instabug the support token
      if (maybeSupportToken) {
        instabugLog(
          JSON.stringify(maybeSupportToken),
          TypeLogs.INFO,
          "support-token"
        );
      }
      // set or remove the properties
      setInstabugSupportTokenAttribute(maybeSupportToken);
      setInstabugDeviceIdAttribute(payload.deviceUniqueId);

      openInstabugQuestionReport(attachmentConfig);
      return;
    }

    case BugReporting.reportType.question: {
      openInstabugReplies();
      return;
    }

    default:
      return;
  }
}

export interface ContextualHelpProps {
  title: string;
  body: () => React.ReactNode;
}

export interface ContextualHelpPropsMarkdown {
  title: TranslationKeys;
  body: TranslationKeys;
}

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

type Props = OwnProps &
  ComponentProps<typeof BaseHeader> &
  Pick<ComponentProps<typeof ContextualHelpModal>, "faqCategories">;

interface State {
  isHelpVisible: boolean;
  markdownContentLoaded: Option<boolean>;
  contextualHelpModalAnimation: ModalBaseProps["animationType"];
}

const maybeDark = fromPredicate(
  (isDark: boolean | undefined = undefined) => isDark === true
);

const ANDROID_OPEN_REPORT_DELAY = 50 as Millisecond;

class BaseScreenComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      contextualHelpModalAnimation: "slide",
      isHelpVisible: false,
      // if the content is markdown we listen for load end event, otherwise the content is
      // assumed always loaded
      markdownContentLoaded: fromNullable(
        this.props.contextualHelpMarkdown
      ).fold<Option<boolean>>(none, _ => some(false))
    };
  }

  private handleOnRequestAssistance = (payload: RequestAssistancePayload) => {
    // if reportAttachmentTypes is undefined use the default attachment config
    const attachmentConfig: DefaultReportAttachmentTypeConfiguration = {
      ...(this.props.reportAttachmentTypes ??
        defaultAttachmentTypeConfiguration),
      screenshot: payload.shouldSendScreenshot ?? true
    };

    if (payload.supportType === BugReporting.reportType.bug) {
      const contextualHelpModalAnimation = Platform.select<
        ModalBaseProps["animationType"]
      >({
        ios: "slide",
        default: "none"
      });
      this.setState({ contextualHelpModalAnimation }, () => {
        this.setState({ isHelpVisible: false }, () => {
          // since in Android we have no way to handle Modal onDismiss event https://reactnative.dev/docs/modal#ondismiss
          // we force handling here. The timeout is due to wait until the modal is completely hidden
          // otherwise in the Instabug screeshoot we will see the contextual help content instead the screen below
          // TODO: To complete the porting to 0.63.x, both iOS and Android will use the timeout. https://www.pivotaltracker.com/story/show/174195300
          setTimeout(
            () => handleOnContextualHelpDismissed(payload, attachmentConfig),
            ANDROID_OPEN_REPORT_DELAY
          );
          this.setState({ contextualHelpModalAnimation: "slide" });
        });
      });
    } else {
      // don't close modal if the report isn't a bug (bug brings a screenshot)
      handleOnContextualHelpDismissed(payload, attachmentConfig);
    }
  };

  private showHelp = () => {
    maybeDark(this.props.dark).map(_ =>
      setStatusBarColorAndBackground("dark-content", customVariables.colorWhite)
    );
    this.setState({
      isHelpVisible: true,
      markdownContentLoaded: fromNullable(
        this.props.contextualHelpMarkdown
      ).fold<Option<boolean>>(none, _ => some(false))
    });
  };

  private hideHelp = () => {
    maybeDark(this.props.dark).map(_ =>
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      )
    );
    this.setState({ isHelpVisible: false });
  };

  private handleOnLinkClicked = (url: string) => {
    // manage links with IO_INTERNAL_LINK_PREFIX as prefix
    if (isIoInternalLink(url)) {
      this.hideHelp();
      return;
    }

    // manage links with IO_CUSTOM_HANDLED_PRESS_PREFIX as prefix
    const customHandledLink = deriveCustomHandledLink(url);
    customHandledLink.map(link => handleItemOnPress(link.url)());
  };

  public render() {
    const {
      accessibilityEvents,
      accessibilityLabel,
      dark,
      appLogo,
      contextualHelp,
      contextualHelpMarkdown,
      goBack,
      headerBody,
      headerTitle,
      headerBackgroundColor,
      primary,
      isSearchAvailable,
      customRightIcon,
      customGoBack,
      onAccessibilityNavigationHeaderFocus,
      showInstabugChat,
      children,
      faqCategories,
      shouldAskForScreenshotWithInitialValue,
      titleColor
    } = this.props;

    const {
      isHelpVisible,
      contextualHelpModalAnimation,
      markdownContentLoaded
    } = this.state;

    const contextualHelpConfig = contextualHelp
      ? { body: contextualHelp.body, title: contextualHelp.title }
      : contextualHelpMarkdown
      ? {
          body: () => (
            <Markdown
              onLinkClicked={this.handleOnLinkClicked}
              onLoadEnd={() => {
                this.setState({ markdownContentLoaded: some(true) });
              }}
            >
              {I18n.t(contextualHelpMarkdown.body)}
            </Markdown>
          ),
          title: I18n.t(contextualHelpMarkdown.title)
        }
      : undefined;

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
          onShowHelp={
            contextualHelp || contextualHelpMarkdown ? this.showHelp : undefined
          }
          isSearchAvailable={isSearchAvailable}
          body={headerBody}
          appLogo={appLogo}
          customRightIcon={customRightIcon}
          customGoBack={customGoBack}
          titleColor={titleColor}
        />
        {children}
        {contextualHelpConfig && (
          <ContextualHelpModal
            shouldAskForScreenshotWithInitialValue={
              shouldAskForScreenshotWithInitialValue
            }
            title={contextualHelpConfig.title}
            onLinkClicked={this.handleOnLinkClicked}
            body={contextualHelpConfig.body}
            isVisible={isHelpVisible}
            modalAnimation={contextualHelpModalAnimation}
            onRequestAssistance={this.handleOnRequestAssistance}
            close={this.hideHelp}
            contentLoaded={markdownContentLoaded.fold(true, s => s)}
            faqCategories={faqCategories}
          />
        )}
      </Container>
    );
  }
}

export default connectStyle(
  "UIComponent.BaseScreenComponent",
  {},
  mapPropsToStyleNames
)(BaseScreenComponent);

export const testableHandleOnContextualHelpDismissed = isTestEnv
  ? handleOnContextualHelpDismissed
  : undefined;
