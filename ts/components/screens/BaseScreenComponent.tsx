import I18n from "i18n-js";
import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { TranslationKeys } from "../../../locales/locales";
import customVariables from "../../theme/variables";
import { FAQsCategoriesType } from "../../utils/faq";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { ContextualHelpModal } from "../ContextualHelpModal";
import { SearchType } from "../search/SearchButton";
import Markdown from "../ui/Markdown";
import { BaseHeader } from "./BaseHeader";

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
}

class BaseScreenComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isHelpVisible: false
    };
  }

  private showHelp = () => {
    // tslint:disable-next-line:no-unused-expression
    this.props.dark &&
      setStatusBarColorAndBackground(
        "dark-content",
        customVariables.colorWhite
      );
    this.setState({ isHelpVisible: true });
  };

  private hideHelp = () => {
    // tslint:disable-next-line:no-unused-expression
    this.props.dark &&
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      );
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
              <Markdown>{I18n.t(contextualHelpMarkdown.body)}</Markdown>
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
            close={this.hideHelp}
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
