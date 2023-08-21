import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  InteractionManager,
  LayoutAnimation,
  NativeEventSubscription,
  Platform,
  ScrollView,
  StyleProp,
  UIManager,
  View,
  ViewStyle
} from "react-native";
import * as RNFS from "react-native-fs";
import { WebView } from "react-native-webview";
import { connect } from "react-redux";
import { filterXSS } from "xss";
import I18n from "../../../i18n";
import { ReduxProps } from "../../../store/actions/types";
import customVariables from "../../../theme/variables";
import { WithTestID } from "../../../types/WithTestID";
import { remarkProcessor } from "../../../utils/markdown";
import { closeInjectedScript } from "../../../utils/webview";
import MarkdownWebviewComponent from "./MarkdownWebviewComponent";
import { NOTIFY_BODY_HEIGHT_SCRIPT, NOTIFY_LINK_CLICK_SCRIPT } from "./script";

const INJECTED_JAVASCRIPT = `
${NOTIFY_LINK_CLICK_SCRIPT}
`;

const TITILLIUM_WEB_FONT_PATH =
  Platform.OS === "android"
    ? "file:///android_asset/fonts/TitilliumWeb-Regular.ttf"
    : `${RNFS.MainBundlePath}/TitilliumWeb-Regular.ttf`;

const TITILLIUM_WEB_BOLD_FONT_PATH =
  Platform.OS === "android"
    ? "file:///android_asset/fonts/TitilliumWeb-Bold.ttf"
    : `${RNFS.MainBundlePath}/TitilliumWeb-Bold.ttf`;

const GLOBAL_CSS = `
<style>
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: normal;
  src: url('${TITILLIUM_WEB_FONT_PATH}');
}
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: bold;
  src: url('${TITILLIUM_WEB_BOLD_FONT_PATH}');
}

body {
  margin: 0;
  padding: 0;
  color: ${customVariables.textColor};
  font-size: ${customVariables.fontSizeBase}px;
  font-family: 'Titillium Web';
  overflow-wrap: break-word;
  hyphens: auto;
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.3333em;
}

p {
  margin-block-start: 0;
  font-size: ${customVariables.fontSizeBase}px;
}

ul, ol {
  padding-left: 32px;
}

a {
  font-weight: ${customVariables.textLinkWeight};
  color: ${customVariables.textMessageDetailLinkColor};
}

div.custom-block.io-demo-block {
  background-color: ${customVariables.toastColor};
  border-radius: 4px;
  margin-bottom: 32px;
  padding: 4px 8px;
}

div.custom-block.io-demo-block .custom-block-body {
  position: relative;
  padding-right: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: bold;
}

</style>
`;

const generateInlineCss = (cssStyle: string) => `<style>
  ${cssStyle}
  </style>`;

const generateCustomFontList = `<style>
    ol {
      list-style: none;
      counter-reset: li;
    }
    ol li::before {
      content: counter(li);
      counter-increment: li;
      color: ${customVariables.brandPrimary};
      display: inline-block;
      width: 1em;
      margin-left: -1.5em;
      margin-right: 0.5em;
      text-align: right;
      direction: rtl;
      font-weight: bold;
      font-size: 32px;
      line-height: 18px;
    }
  </style>`;

const avoidTextSelectionCSS = `<style>
    body {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  </style>`;

const generateHtml = (
  content: string,
  cssStyle?: string,
  useCustomSortedList: boolean = false,
  avoidTextSelection: boolean = false
) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </head>
    <body>
    ${GLOBAL_CSS}
    ${cssStyle ? generateInlineCss(cssStyle) : ""}
    ${avoidTextSelection ? avoidTextSelectionCSS : ""}
    ${useCustomSortedList ? generateCustomFontList : ""}
    ${content}
    </body>
  </html>
  `;

/**
 * Covert the old demo markdown tag with the new one.
 */
const OLD_DEMO_TAG_MARKDOWN_REGEX = /^\[demo\]([\s\S]+?)\[\/demo\]\s*\n{2,}/;
const convertOldDemoMarkdownTag = (markdown: string) =>
  markdown.replace(
    OLD_DEMO_TAG_MARKDOWN_REGEX,
    (_, g1: string) => `::div[${g1}]{.io-demo-block}\n`
  );

type OwnProps = {
  children: string;
  animated?: boolean;
  extraBodyHeight?: number;
  useCustomSortedList?: boolean;
  onLoadEnd?: () => void;
  onLinkClicked?: (url: string) => void;
  /**
   * if shouldHandleLink returns true the clicked link will be handled by the Markdown component
   * otherwise Markdown will ignore it. If shouldHandleLink is not defined assume () => true
   * @param url
   */
  shouldHandleLink?: (url: string) => boolean;
  onError?: (error: any) => void;
  /**
   * The code will be inserted in the html body between
   * <script> and </script> tags.
   */
  avoidTextSelection?: true;
  cssStyle?: string;
  webViewStyle?: StyleProp<ViewStyle>;
  letUserZoom?: boolean;
};

type Props = WithTestID<OwnProps> & ReduxProps;

type State = {
  html?: string;
  htmlBodyHeight: number;
  webviewKey: number;
  appState: string;
  isLoading: boolean;
};

/**
 * A component to render the message markdown as HTML inside a WebView
 */
class Markdown extends React.PureComponent<Props, State> {
  private webViewRef = React.createRef<WebView>();
  private subscription: NativeEventSubscription | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      html: undefined,
      htmlBodyHeight: 0,
      webviewKey: 0,
      appState: AppState.currentState,
      isLoading: true
    };
  }

  public componentDidMount() {
    const {
      children,
      animated,
      onError,
      cssStyle,
      useCustomSortedList,
      avoidTextSelection
    } = this.props;

    this.compileMarkdownAsync(
      children,
      animated,
      onError,
      cssStyle,
      useCustomSortedList,
      avoidTextSelection
    );

    // eslint-disable-next-line functional/immutable-data
    this.subscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );
  }

  public componentDidUpdate(prevProps: Props) {
    const { children: prevChildren } = prevProps;
    const { children, animated, onError, cssStyle, useCustomSortedList } =
      this.props;

    // If the children changes we need to re-compile it
    if (children !== prevChildren) {
      this.setState({ isLoading: true });
      this.compileMarkdownAsync(
        children,
        animated,
        onError,
        cssStyle,
        useCustomSortedList
      );
    }
  }

  public componentWillUnmount(): void {
    this.subscription?.remove();
  }

  public handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.state.appState !== "active" && nextAppState === "active") {
      this.reloadWebView();
    }
    this.setState({ appState: nextAppState });
  };

  private reloadWebView() {
    if (Platform.OS === "ios") {
      this.setState({
        webviewKey: this.state.webviewKey + 1
      });
    }
  }

  public render() {
    const { extraBodyHeight, webViewStyle } = this.props;
    const { html, htmlBodyHeight } = this.state;
    const containerStyle: ViewStyle = {
      height: htmlBodyHeight + (extraBodyHeight || 0)
    };

    return (
      <React.Fragment>
        {this.state.isLoading && (
          <ActivityIndicator
            testID={this.props.testID}
            size={"large"}
            color={customVariables.brandPrimary}
            animating={true}
            accessible={true}
            accessibilityHint={I18n.t(
              "global.accessibility.activityIndicator.hint"
            )}
            accessibilityLabel={I18n.t(
              "global.accessibility.activityIndicator.label"
            )}
          />
        )}
        {/* Hide the WebView until we have the htmlBodyHeight */}
        {html && (
          <ScrollView nestedScrollEnabled={false} style={containerStyle}>
            <View style={containerStyle}>
              <MarkdownWebviewComponent
                injectedJavascript={INJECTED_JAVASCRIPT}
                handleLoadEnd={this.handleLoadEnd}
                shouldHandleLink={this.props.shouldHandleLink}
                html={html}
                webviewKey={this.state.webviewKey}
                webViewRef={this.webViewRef}
                setLoadingFalse={() => this.setState({ isLoading: false })}
                setHtmlBodyHeight={(h: number) =>
                  this.setState({ htmlBodyHeight: h })
                }
                webViewStyle={webViewStyle}
                onLinkClicked={this.props.onLinkClicked}
                letUserZoom={this.props.letUserZoom}
                testID={this.props.testID}
              />
            </View>
          </ScrollView>
        )}
      </React.Fragment>
    );
  }

  // When the injected html is loaded inject the script to notify the height
  private handleLoadEnd = () => {
    if (this.props.onLoadEnd) {
      this.props.onLoadEnd();
    }
    setTimeout(() => {
      // to avoid yellow box warning
      // it's ugly but it works https://github.com/react-native-community/react-native-webview/issues/341#issuecomment-466639820
      if (this.webViewRef.current) {
        this.webViewRef.current.injectJavaScript(
          closeInjectedScript(NOTIFY_BODY_HEIGHT_SCRIPT)
        );
      }
    }, 100);
  };

  // A function that uses remark to compile the markdown to html
  private compileMarkdownAsync = (
    markdown: string,
    animated: boolean = false,
    onError?: (error: any) => void,
    cssStyle?: string,
    useCustomSortedList: boolean = false,
    avoidTextSelection: boolean = false
  ) => {
    void InteractionManager.runAfterInteractions(() => {
      if (animated) {
        // Animate the layout change
        // See https://facebook.github.io/react-native/docs/layoutanimation.html
        if (UIManager.setLayoutAnimationEnabledExperimental) {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      remarkProcessor.process(
        convertOldDemoMarkdownTag(
          // sanitize html to prevent xss attacks
          filterXSS(markdown, { stripIgnoreTagBody: ["script"] })
        ),
        (error: any, file: any) => {
          // for retro compatibility
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          error
            ? pipe(
                O.fromNullable(onError),
                O.map(_ => _(error))
              )
            : this.setState({
                html: generateHtml(
                  String(file),
                  cssStyle,
                  useCustomSortedList,
                  avoidTextSelection
                )
              });
        }
      );
    });
  };
}

export type MarkdownProps = OwnProps;

export default connect()(Markdown);
