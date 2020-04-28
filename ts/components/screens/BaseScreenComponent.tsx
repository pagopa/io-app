import {
  fromNullable,
  fromPredicate,
  none,
  Option,
  some
} from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { BugReporting, Replies } from "instabug-reactnative";
import { Millisecond } from "italia-ts-commons/lib/units";
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
import Markdown from "../ui/Markdown";
import BaseHeader from './BaseHeader';

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
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  withSafeArea?: boolean;
}

type Props = OwnProps & React.ComponentProps<typeof BaseHeader>;

export type BaseScreenComponentProps = Props;

interface State {
  isHelpVisible: boolean;
  requestReport: Option<BugReporting.reportType>;
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
          // we force handling here. The timeout is due to wait until the modal is completely hidden
          // otherwise in the Instabug screeshoot we will see the contextual help content instead the screen below
          if (Platform.OS === "android") {
            setTimeout(
              this.handleOnContextualHelpDismissed,
              ANDROID_OPEN_REPORT_DELAY
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
            Replies.hasChats(hasChats => {
              openInstabugChat(hasChats);
            });

            break;
        }
      });
    });
  };

  private showHelp = () => {
    maybeDark(this.props.dark || this.props.primary).map(_ =>
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
    maybeDark(this.props.dark || this.props.primary).map(_ =>
      setStatusBarColorAndBackground(
        "light-content",
        this.props.dark ? customVariables.brandDarkGray : customVariables.contentPrimaryBackground
      )
    );
    this.handleOnContextualHelpDismissed();
    this.setState({ isHelpVisible: false });
  };

  public render() {
    const {
      contextualHelp,
      contextualHelpMarkdown,
      headerBody,
      withSafeArea
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
      <Container withSafeArea={withSafeArea}>
        <BaseHeader
          {...this.props}
          onShowHelp={
            contextualHelp || contextualHelpMarkdown ? this.showHelp : undefined
          }
          body={headerBody}
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
