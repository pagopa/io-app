import merge from "lodash/merge";
import { Text, View } from "native-base";
import * as React from "react";
import * as SimpleMarkdown from "simple-markdown";

import { isDevEnvironment } from "../../../config";
import I18n from "../../../i18n";
import reactNativeRules from "./rules";

// A regex to test if a string ends with `/n/n`
const BLOCK_END_REGEX = /\n{2,}$/;

// Merge the default SimpleMarkdown rules with the react native ones
const rules = merge(SimpleMarkdown.defaultRules, reactNativeRules);

/**
 * A component that accepts "markdown" as child and render react native components.
 */
class Markdown extends React.Component<{}, never> {
  public renderChildren(children: React.ReactNode): React.ReactNode {
    try {
      /**
       * Since many rules expect blocks to end in "\n\n", we append that (if needed) to markdown input manually,
       * in addition to specifying inline: false when creating the syntax tree.
       */
      const blockSource = BLOCK_END_REGEX.test(`${children}`)
        ? `${children}`
        : `${children}\n\n`;

      // Generate the syntax tree
      const syntaxTree = SimpleMarkdown.parserFor(rules)(blockSource, {
        inline: false
      });

      // Render the syntax tree using the rules and return the value
      return SimpleMarkdown.reactFor(
        SimpleMarkdown.ruleOutput(rules, "react_native")
      )(syntaxTree);
    } catch (error) {
      return isDevEnvironment ? (
        <Text>${children}</Text>
      ) : (
        <Text>{I18n.t("global.markdown.decodeError")}</Text>
      );
    }
  }

  public render() {
    return <View>{this.renderChildren(this.props.children)}</View>;
  }
}

export default Markdown;
