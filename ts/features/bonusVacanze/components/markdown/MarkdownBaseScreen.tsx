import { View } from "native-base";
import { useEffect, useState } from "react";
import * as React from "react";
import { StyleSheet } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../../../components/screens/ScreenContent";
import Markdown from "../../../../components/ui/Markdown";
import themeVariables from "../../../../theme/variables";

type Props = {
  markDown: string;
  title: string;
  subtitle: string;
};

const styles = StyleSheet.create({
  markdownContainer: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  }
});

/**
 * A base screen that allow the rendering of a markdown, in addition with a title and subtitle
 * @param props
 * @constructor
 */
export const MarkdownBaseScreen: React.FunctionComponent<Props> = props => {
  const [isMarkdownLoaded, setMarkdownLoaded] = useState(false);

  useEffect(() => setMarkdownLoaded(false), [props.markDown]);

  return (
    <BaseScreenComponent goBack={true} headerTitle={props.title}>
      <ScreenContent
        title={props.title}
        subtitle={props.subtitle}
        bounces={false}
      >
        <View style={styles.markdownContainer}>
          <Markdown onLoadEnd={() => setMarkdownLoaded(true)}>
            {props.markDown}
          </Markdown>
          {isMarkdownLoaded && <EdgeBorderComponent />}
        </View>
      </ScreenContent>
      {isMarkdownLoaded && props.children}
    </BaseScreenComponent>
  );
};
