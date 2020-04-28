import * as React from "react";
import { ComponentProps } from "../../types/react";
import { FAQsCategoriesType } from "../../utils/faq";
import { SearchType } from "../search/SearchButton";
import BaseScreenComponent from "./BaseScreenComponent";

interface OwnProps {
  headerTitle?: string;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
}

type BaseScreenComponentProps =
  | "dark"
  | "appLogo"
  | "goBack"
  | "contextualHelp"
  | "contextualHelpMarkdown"
  | "headerBody"
  | "customRightBack";

type Props = OwnProps &
  Pick<ComponentProps<typeof BaseScreenComponent>, BaseScreenComponentProps>;

export type TopScreenComponentProps = Props;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    const {
      dark,
      appLogo,
      goBack,
      headerTitle,
      contextualHelp,
      contextualHelpMarkdown,
      headerBody,
      isSearchAvailable,
      searchType,
      customRightBack,
      faqCategories
    } = this.props;

    return (
      <BaseScreenComponent
        appLogo={appLogo}
        dark={dark}
        goBack={goBack}
        headerTitle={goBack ? headerTitle : undefined}
        contextualHelp={contextualHelp}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={faqCategories}
        headerBody={headerBody}
        isSearchAvailable={isSearchAvailable}
        searchType={searchType}
        customRightBack={customRightBack}
      >
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
