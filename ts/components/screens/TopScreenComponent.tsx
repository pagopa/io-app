import * as React from "react";

import { ComponentProps } from "../../types/react";
import { SearchType } from "../search/SearchButton";
import BaseScreenComponent from "./BaseScreenComponent";
import { ScreenContentHeader } from "./ScreenContentHeader";

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
  | "headerBody";

type Props = OwnProps &
  Pick<ComponentProps<typeof ScreenContentHeader>, "title"> &
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
      title,
      headerTitle,
      contextualHelp,
      headerBody,
      isSearchAvailable,
      searchType,
      customRightIcon
    } = this.props;

    return (
      <BaseScreenComponent
        appLogo={appLogo}
        dark={dark}
        goBack={goBack}
        headerTitle={goBack ? headerTitle || title : undefined}
        contextualHelp={contextualHelp}
        headerBody={headerBody}
        isSearchAvailable={isSearchAvailable}
        searchType={searchType}
        customRightIcon={customRightIcon}
      >
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
