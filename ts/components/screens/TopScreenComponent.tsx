import * as React from "react";

import { ComponentProps } from "../../types/react";
import BaseScreenComponent from "./BaseScreenComponent";
import { ScreenContentHeader } from "./ScreenContentHeader";

interface OwnProps {
  headerTitle?: string;
}

type BaseScreenComponentProps =
  | "appLogo"
  | "goBack"
  | "contextualHelp"
  | "headerBody";

type Props = OwnProps &
  Pick<ComponentProps<typeof ScreenContentHeader>, "title"> &
  Pick<ComponentProps<typeof BaseScreenComponent>, BaseScreenComponentProps>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    const {
      appLogo,
      goBack,
      title,
      headerTitle,
      contextualHelp,
      headerBody
    } = this.props;

    return (
      <BaseScreenComponent
        appLogo={appLogo}
        goBack={goBack}
        headerTitle={goBack ? headerTitle || title : undefined}
        contextualHelp={contextualHelp}
        headerBody={headerBody}
      >
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
