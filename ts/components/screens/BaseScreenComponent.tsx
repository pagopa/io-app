import {
  fromNullable,
  fromPredicate,
  none,
  Option,
  some
} from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Container} from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { TranslationKeys } from "../../../locales/locales";
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
}

type Props = OwnProps & React.ComponentProps<typeof BaseHeader>;

interface State {
  isHelpVisible: boolean;
  markdownContentLoaded: Option<boolean>;
}

const maybeDark = fromPredicate(
  (isDark: boolean | undefined = undefined) => isDark === true
);

class BaseScreenComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isHelpVisible: false,
      // if the content is markdown we listen for load end event, otherwise the content is
      // assumed always loaded
      markdownContentLoaded: fromNullable(
        this.props.contextualHelpMarkdown
      ).fold<Option<boolean>>(none, _ => some(false))
    };
  }

  private showHelp = () => {
    maybeDark(this.props.dark || this.props.primary).map(_ =>
      setStatusBarColorAndBackground("dark-content", customVariables.colorWhite)
    );

    this.setState({ isHelpVisible: true });
  };

  private hideHelp = () => {
    maybeDark(this.props.dark || this.props.primary).map(_ =>
      setStatusBarColorAndBackground(
        "light-content",
        this.props.dark ? customVariables.brandDarkGray : customVariables.contentPrimaryBackground
      )
    );

    this.setState({ isHelpVisible: false });
  };

  public render() {
    const {
      contextualHelp,
      contextualHelpMarkdown,
      headerBody
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
