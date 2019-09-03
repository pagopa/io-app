import { Content, View } from "native-base";
import * as React from "react";
import { InteractionManager, StyleSheet } from "react-native";

import themeVariables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import ActivityIndicator from "../ui/ActivityIndicator";
import Markdown from "../ui/Markdown";
import BaseScreenComponent from "./BaseScreenComponent";

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 100
  }
});

interface OwnProps {
  readonly markdown: string;
  headerContent?: React.ReactNode;
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
            <ActivityIndicator color={themeVariables.brandPrimaryLight} />
          </View>
        )}
        {this.state.content && (
          <Content contentContainerStyle={styles.contentContainer}>
            {this.props.headerContent}
            {this.state.content}
          </Content>
        )}
      </BaseScreenComponent>
    );
  }
}
