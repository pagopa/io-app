import { Content, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, InteractionManager } from "react-native";

import Markdown from "../ui/Markdown";

import BaseScreenComponent from "./BaseScreenComponent";

import { ComponentProps } from "../../types/react";

import themeVariables from "../../theme/variables";

interface OwnProps {
  readonly markdown: string;
}

type T = typeof BaseScreenComponent;

type Props = OwnProps & ComponentProps<T>;

type State = Readonly<{
  content: React.ReactNode | null;
}>;

/**
 * A screen which content is rendered from a Markdown source
 */
export class MarkdownScreenComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      content: null
    };
  }

  public componentDidMount() {
    InteractionManager.runAfterInteractions(() =>
      this.setState({
        content: <Markdown>{this.props.markdown}</Markdown>
      })
    );
  }

  public render() {
    return (
      <BaseScreenComponent {...this.props}>
        {!this.state.content && (
          <View centerJustified={true}>
            <ActivityIndicator
              size="large"
              color={themeVariables.brandPrimaryLight}
            />
          </View>
        )}
        {this.state.content && <Content>{this.state.content}</Content>}
      </BaseScreenComponent>
    );
  }
}
