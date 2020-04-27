import {
  fromNullable,
  fromPredicate,
  none,
  Option,
  some
} from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { BugReporting } from "instabug-reactnative";
import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { ModalBaseProps, Platform } from "react-native";
import { TranslationKeys } from "../../../locales/locales";
import {
  openInstabugBugReport,
  openInstabugChat
} from "../../boot/configureInstabug";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { ContextualHelpModal } from "../ContextualHelpModal";
import { SearchType } from "../search/SearchButton";
import Markdown from "../ui/Markdown";
import { BaseHeader } from "./BaseHeader";
import { Millisecond } from "italia-ts-commons/lib/units";

export interface ContextualHelpProps {
  title: string;
  body: () => React.ReactNode;
}

export interface ContextualHelpPropsMarkdown {
  title: TranslationKeys;
  body: TranslationKeys;
}

interface OwnProps {
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  headerBody?: React.ReactNode;
  appLogo?: boolean;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
}

type BaseHeaderProps =
  | "dark"
  | "appLogo"
  | "primary"
  | "goBack"
  | "headerTitle"
  | "onShowHelp"
  | "body"
  | "isSearchAvailable"
  | "searchType"
  | "customRightIcon"
  | "customGoBack";

type Props = OwnProps &
  Pick<React.ComponentProps<typeof BaseHeader>, BaseHeaderProps>;

interface State {
  isHelpVisible: boolean;
  requestReport: Option<BugReporting.reportType>;
  markdownContentLoaded: Option<boolean>;
  contextualHelpModalAnimation: ModalBaseProps["animationType"];
}

const maybeDark = fromPredicate(
  (isDark: boolean | undefined = undefined) => isDark === true
);

const ANDROID_REPORT_DELAY = 50 as Millisecond;

class BaseScreenComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      contextualHelpModalAnimation: "slide",
      isHelpVisible: false,
      requestReport: none,
      // if the content is markdown we listen for load end event, otherwise the content is
      // assumed always loaded
      markdownContentLoaded: fromNullable(
        this.props.contextualHelpMarkdown
      ).fold<Option<boolean>>(none, _ => some(false))
    };
  }

  private handleOnRequestAssistance = (type: BugReporting.reportType) => {
    this.setState({ contextualHelpModalAnimation: "none" }, () => {
      this.setState({ isHelpVisible: false }, () => {
        this.setState({ requestReport: some(type) }, () => {
          // since in Android we have no way to handle Modal onDismiss event https://reactnative.dev/docs/modal#ondismiss
          // we force handling here. The timeout is due to wait until the modal is completly hidden
          // otherwise in the Instabug screeshoot we will se the contextual help content instead the screen below
          if (Platform.OS === "android") {
            setTimeout(
              this.handleOnContextualHelpDismissed,
              ANDROID_REPORT_DELAY
            );
          }
          this.setState({ contextualHelpModalAnimation: "slide" });
        });
      });
    });
  };

  private handleOnContextualHelpDismissed = () => {
    const maybeReport = this.state.requestReport;
    this.setState({ requestReport: none }, () => {
      maybeReport.map(type => {
        switch (type) {
          case BugReporting.reportType.bug:
            openInstabugBugReport();
            break;
          case BugReporting.reportType.question:
            openInstabugChat();
            break;
        }
      });
    });
  };

  private showHelp = () => {
    maybeDark(this.props.dark).map(_ =>
      setStatusBarColorAndBackground("dark-content", customVariables.colorWhite)
    );
    this.setState({ isHelpVisible: true });
  };

  private hideHelp = () => {
    maybeDark(this.props.dark).map(_ =>
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      )
    );
    this.handleOnContextualHelpDismissed();
    this.setState({ isHelpVisible: false });
  };

  public render() {
    const {
      dark,
      appLogo,
      contextualHelp,
      contextualHelpMarkdown,
      goBack,
      headerBody,
      headerTitle,
      primary,
      isSearchAvailable,
      searchType,
      customRightIcon,
      customGoBack
    } = this.props;

    const ch = contextualHelp
      ? { body: contextualHelp.body, title: contextualHelp.title }
      : contextualHelpMarkdown
        ? {
            body: () => (
              <Markdown
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
          primary={primary}
          dark={dark}
          goBack={goBack}
          headerTitle={headerTitle}
          onShowHelp={
            contextualHelp || contextualHelpMarkdown ? this.showHelp : undefined
          }
          isSearchAvailable={isSearchAvailable}
          searchType={searchType}
          body={headerBody}
          appLogo={appLogo}
          customRightIcon={customRightIcon}
          customGoBack={customGoBack}
        />
        {this.props.children}
        {ch && (
          <ContextualHelpModal
            title={ch.title}
            body={ch.body}
            isVisible={this.state.isHelpVisible}
            modalAnimation={this.state.contextualHelpModalAnimation}
            onRequestAssistance={this.handleOnRequestAssistance}
            close={this.hideHelp}
            contentLoaded={this.state.markdownContentLoaded.fold(true, s => s)}
            faqCategories={this.props.faqCategories}
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
