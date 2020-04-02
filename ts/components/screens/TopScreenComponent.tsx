import * as React from "react";
import { ComponentProps } from "../../types/react";
import { SearchType } from "../search/SearchButton";
import BaseScreenComponent from "./BaseScreenComponent";

interface OwnProps {
  headerTitle?: string;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
  customRightIcon?: {
    iconName: string;
    onPress: () => void;
  };
}

type BaseScreenComponentProps =
  | "dark"
  | "appLogo"
  | "goBack"
  | "contextualHelp"
  | "contextualHelpMarkdown"
  | "headerBody"
  | "customGoBack";

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
      customRightIcon,
      customGoBack
    } = this.props;

    return (
      <BaseScreenComponent
        appLogo={appLogo}
        dark={dark}
        goBack={goBack}
        headerTitle={goBack ? headerTitle : undefined}
        contextualHelp={contextualHelp}
        contextualHelpMarkdown={contextualHelpMarkdown}
        headerBody={headerBody}
        isSearchAvailable={isSearchAvailable}
        searchType={searchType}
        customRightIcon={customRightIcon}
        customGoBack={customGoBack}
      >
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
