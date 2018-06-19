import merge from "lodash/merge";
import { View } from "native-base";
import * as React from "react";
import * as SimpleMarkdown from "simple-markdown";

import reactNativeRules from "./rules";

// Merge the default SimpleMarkdown rules with the react native ones
const rules = merge(SimpleMarkdown.defaultRules, reactNativeRules);

/**
 * A component that accepts "markdown" as child and render react native components.
 */
class Markdown extends React.Component<{}, never> {
  public renderChildren(children: React.ReactNode): React.ReactNode {
    try {
      // Add new line to the markdown
      const blockSource = `${children}\n\n`;

      // Generate the syntax tree
      const syntaxTree = SimpleMarkdown.parserFor(rules)(blockSource, {
        inline: false
      });

      // Render the syntax tree using the rules and return the value
      return SimpleMarkdown.reactFor(
        SimpleMarkdown.ruleOutput(rules, "react_native")
      )(syntaxTree);
    } catch (error) {
      return null;
    }
  }

  public render() {
    return <View>{this.renderChildren(this.props.children)}</View>;
  }
}

export default Markdown;
