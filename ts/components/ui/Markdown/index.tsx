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

// instantiate the Markdown parser
const markdownParser = SimpleMarkdown.parserFor(rules);

// see https://www.npmjs.com/package/simple-markdown#simplemarkdownruleoutputrules-key
const ruleOutput = SimpleMarkdown.ruleOutput(rules, "react_native");
const reactOutput = SimpleMarkdown.reactFor(ruleOutput);

function renderMarkdown(body: string): React.ReactNode {
  try {
    /**
     * Since many rules expect blocks to end in "\n\n", we append that
     * (if needed) to markdown input manually, in addition to specifying
     * inline: false when creating the syntax tree.
     */
    const blockSource = BLOCK_END_REGEX.test(body) ? body : body + "\n\n";

    // Generate the syntax tree
    const syntaxTree = markdownParser(blockSource, {
      inline: false
    });

    // Render the syntax tree using the rules and return the value
    return reactOutput(syntaxTree);
  } catch (error) {
    return isDevEnvironment ? (
      <Text>
        COULD NOT PARSE MARKDOWN:
        {body}
      </Text>
    ) : (
      <Text>{I18n.t("global.markdown.decodeError")}</Text>
    );
  }
}

interface Props {
  children: string;
  lazy?: boolean;
}

interface State {
  renderedMarkdown: ReturnType<typeof renderMarkdown> | undefined;
}

/**
 * A component that accepts "markdown" as child and render react native
 * components.
 */
class Markdown extends React.PureComponent<Props, State> {
  public static defaultProps: Partial<Props> = {
    lazy: false
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      renderedMarkdown: undefined
    };
  }

  public componentDidMount() {
    if (this.props.lazy) {
      // Render the markdown string asynchronously.
      setTimeout(
        () =>
          this.setState({
            renderedMarkdown: renderMarkdown(this.props.children)
          }),
        0
      );
    }
  }

  public render() {
    if (this.props.lazy) {
      if (!this.state.renderedMarkdown) {
        return null;
      }

      return <View>{this.state.renderedMarkdown}</View>;
    }

    return <View>{renderMarkdown(this.props.children)}</View>;
  }
}

export default Markdown;
