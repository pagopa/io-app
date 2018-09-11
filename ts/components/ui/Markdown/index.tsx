import merge from "lodash/merge";
import { Text, View } from "native-base";
import * as React from "react";
import * as SimpleMarkdown from "simple-markdown";

import { InteractionManager, LayoutAnimation, UIManager } from "react-native";
import { isDevEnvironment } from "../../../config";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import ActivityIndicator from "../activityIndicator";
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

interface BaseProps {
  children: string;
}

interface NonLazyProps extends BaseProps {
  lazy?: false;
}

interface LazyProps extends BaseProps {
  lazy: true;

  // Animates the layout, useful when there are other components below the
  // Markdown component: enabling this will animate the growth of the
  // Markdown component once the content gets rendered.
  animated?: boolean;
}

type Props = NonLazyProps | LazyProps;

interface State {
  renderedMarkdown: ReturnType<typeof renderMarkdown> | undefined;
  cancelRender?: () => void;
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
    const props = this.props;
    if (props.lazy) {
      // Render the markdown string asynchronously.
      const cancelRender = InteractionManager.runAfterInteractions(() => {
        if (props.animated) {
          // animate the layout change
          // see https://facebook.github.io/react-native/docs/layoutanimation.html
          if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
          }
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        this.setState({
          renderedMarkdown: renderMarkdown(props.children)
        });
      }).cancel;
      this.setState({
        cancelRender
      });
    }
  }

  public componentWillUnmount() {
    if (this.state.cancelRender) {
      // before unmounting, cancel the delayed rendering
      this.state.cancelRender();
    }
  }

  public render() {
    if (this.props.lazy) {
      if (!this.state.renderedMarkdown) {
        return (
          <View centerJustified={true}>
            <ActivityIndicator color={variables.brandPrimaryLight} />
          </View>
        );
      }

      return <View>{this.state.renderedMarkdown}</View>;
    }

    return <View>{renderMarkdown(this.props.children)}</View>;
  }
}

export default Markdown;
