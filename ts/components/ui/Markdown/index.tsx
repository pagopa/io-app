import merge from "lodash/merge";
import { Text, View } from "native-base";
import * as React from "react";
import { InteractionManager, LayoutAnimation, UIManager } from "react-native";
import { connect } from "react-redux";
import * as SimpleMarkdown from "simple-markdown";

import { isDevEnvironment } from "../../../config";
import I18n from "../../../i18n";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";
import ActivityIndicator from "../ActivityIndicator";
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

function renderMarkdown(
  body: string,
  dispatch: Dispatch,
  initialState: SimpleMarkdown.State = {}
): React.ReactNode {
  try {
    /**
     * Since many rules expect blocks to end in "\n\n", we append that
     * (if needed) to markdown input manually, in addition to specifying
     * inline: false when creating the syntax tree.
     */
    const blockSource = BLOCK_END_REGEX.test(body) ? body : body + "\n\n";

    // We merge the initialState with always needed attributes
    const state: SimpleMarkdown.State = {
      ...initialState,
      inline: false,
      dispatch
    };

    // Generate the syntax tree
    const syntaxTree = markdownParser(blockSource, {
      inline: false
    });

    // Render the syntax tree using the rules and return the value
    return reactOutput(syntaxTree, state);
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

type NotLazy = {
  lazy: false;
};

type Lazy = {
  lazy: true;
  animated?: boolean;
};

type OwnProps = {
  children: string;
  lazyOptions?: NotLazy | Lazy;
  initialState?: SimpleMarkdown.State;
};

type Props = OwnProps & ReduxProps;

interface State {
  renderedMarkdown: ReturnType<typeof renderMarkdown> | undefined;
  cancelRender?: () => void;
}

/**
 * A component that accepts "markdown" as child and render react native
 * components.
 */
export class Markdown extends React.PureComponent<Props, State> {
  public static defaultProps: Pick<Props, "lazyOptions"> = {
    lazyOptions: {
      lazy: false
    }
  };

  private renderLazy = (
    lazyOptions: Lazy,
    children: Props["children"],
    dispatch: Dispatch,
    initialState?: Props["initialState"]
  ) => {
    this.setState({
      renderedMarkdown: undefined
    });
    // Render the markdown string asynchronously.
    const cancelRender = InteractionManager.runAfterInteractions(() => {
      if (lazyOptions.animated) {
        // animate the layout change
        // see https://facebook.github.io/react-native/docs/layoutanimation.html
        if (UIManager.setLayoutAnimationEnabledExperimental) {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      const renderedMarkdown = renderMarkdown(children, dispatch, initialState);
      this.setState({
        renderedMarkdown
      });
    }).cancel;
    this.setState({
      cancelRender
    });
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      renderedMarkdown: undefined
    };
  }

  public componentDidMount() {
    const { lazyOptions, children, initialState, dispatch } = this.props;
    if (lazyOptions && lazyOptions.lazy) {
      this.renderLazy(lazyOptions, children, dispatch, initialState);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { lazyOptions, children, initialState, dispatch } = this.props;
    const { children: prevChildren } = prevProps;
    const isContentChanged = prevChildren !== children;
    if (isContentChanged && lazyOptions && lazyOptions.lazy) {
      // we got new content that we are going to render lazily

      if (this.state.cancelRender) {
        // if we're still rendering the previous content, cancel the rendering
        this.state.cancelRender();
      }

      // render the new content
      this.renderLazy(lazyOptions, children, dispatch, initialState);
    }
  }

  public componentWillUnmount() {
    if (this.state.cancelRender) {
      // before unmounting, cancel the delayed rendering
      this.state.cancelRender();
    }
  }

  public render() {
    const { lazyOptions, children, initialState, dispatch } = this.props;
    if (lazyOptions && lazyOptions.lazy) {
      if (!this.state.renderedMarkdown) {
        return (
          <View centerJustified={true}>
            <ActivityIndicator color={variables.brandPrimaryLight} />
          </View>
        );
      }
      return <View>{this.state.renderedMarkdown}</View>;
    }

    return <View>{renderMarkdown(children, dispatch, initialState)}</View>;
  }
}

export default connect()(Markdown);
