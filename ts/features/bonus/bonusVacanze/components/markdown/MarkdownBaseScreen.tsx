import { useEffect, useState } from "react";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../../../../components/screens/ScreenContent";
import Markdown from "../../../../../components/ui/Markdown";
import themeVariables from "../../../../../theme/variables";

/**
 * TODO Rename the title prop in the BaseScreenComponent to navigationTitle
 * https://www.pivotaltracker.com/story/show/173056117
 */
type Props = {
  markDown: string;
  navigationTitle?: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
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
    <BaseScreenComponent goBack={true} headerTitle={props.navigationTitle}>
      <ScreenContent
        title={props.title}
        subtitle={props.subtitle}
        bounces={false}
        hideHeader={props.hideHeader}
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
