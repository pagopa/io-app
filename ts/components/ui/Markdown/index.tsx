/**
 * A component to render the message markdown as HTML inside a WebView
 */
import { fromNullable } from "fp-ts/lib/Option";
import React from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  ActivityIndicator,
  InteractionManager,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleProp,
  UIManager,
  View,
  ViewStyle
} from "react-native";
import * as RNFS from "react-native-fs";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import { filterXSS } from "xss";

import { ReduxProps } from "../../../store/actions/types";
import customVariables from "../../../theme/variables";
import { remarkProcessor } from "../../../utils/markdown";
import { handleLinkMessage } from "./handlers/link";
import { NOTIFY_BODY_HEIGHT_SCRIPT, NOTIFY_LINK_CLICK_SCRIPT } from "./script";
import { WebViewMessage } from "./types";

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

const IO_ICON_FONT_PATH =
  Platform.OS === "android"
    ? "file:///android_asset/fonts/io-icon-font.ttf"
    : `${RNFS.MainBundlePath}/io-icon-font.ttf`;

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

@font-face {
  font-family: 'io-icon-font';
  font-weight: normal;
  font-style: normal;
  src: url('${IO_ICON_FONT_PATH}');
}

body {
  margin: 0;
  padding: 0;
  color: ${customVariables.textColor};
  font-size: 16px;
  font-family: 'Titillium Web';
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.3333em;
}

p {
  margin-block-start: 0;
}

ul, ol {
  padding-left: 32px;
}

a {
  font-weight: ${customVariables.textLinkWeight};
  color: ${customVariables.textMessageDetailLinkColor};
}

div.custom-block.io-demo-block {
  background-color: #c1f4f2;
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

div.custom-block.io-demo-block .custom-block-body::after {
  position: absolute;
  right: 0;
  font-family: 'io-icon-font';
  font-size: ${customVariables.iconSize6}px;
  font-weight: normal;
  content: "\\50";
}
</style>
`;

const generateInlineCss = (cssStyle: string) => {
  return `<style>
  ${cssStyle}
  </style>`;
};

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
) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  <head>
  <body>
  ${GLOBAL_CSS}
  ${cssStyle ? generateInlineCss(cssStyle) : ""}
  ${avoidTextSelection ? avoidTextSelectionCSS : ""}
  ${useCustomSortedList ? generateCustomFontList : ""}
  ${content}
  </body>
  </html>
  `;
};

/**
 * Covert the old demo markdown tag with the new one.
 */
const OLD_DEMO_TAG_MARKDOWN_REGEX = /^\[demo\]([\s\S]+?)\[\/demo\]\s*\n{2,}/;
const convertOldDemoMarkdownTag = (markdown: string) =>
  markdown.replace(
    OLD_DEMO_TAG_MARKDOWN_REGEX,
    (_, g1: string) => `[[IO-DEMO]]\n| ${g1}\n`
  );

type OwnProps = {
  children: string;
  animated?: boolean;
  useCustomSortedList?: boolean;
  onLoadEnd?: () => void;
  onLinkClicked?: (url: string) => void;
  onError?: (error: any) => void;
  /**
   * The code will be inserted in the html body between
   * <script> and </script> tags.
   */
  avoidTextSelection?: boolean;
  cssStyle?: string;
  webViewStyle?: StyleProp<ViewStyle>;
};

type Props = OwnProps & ReduxProps;

type State = {
  html?: string;
  htmlBodyHeight: number;
  webviewKey: number;
  appState: string;
};

class Markdown extends React.PureComponent<Props, State> {
  private webViewRef = React.createRef<WebView>();

  constructor(props: Props) {
    super(props);
    this.state = {
      html: undefined,
      htmlBodyHeight: 0,
      webviewKey: 0,
      appState: AppState.currentState
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

    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public componentDidUpdate(prevProps: Props) {
    const { children: prevChildren } = prevProps;
    const {
      children,
      animated,
      onError,
      cssStyle,
      useCustomSortedList
    } = this.props;

    // If the children changes we need to re-compile it
    if (children !== prevChildren) {
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
    AppState.removeEventListener("change", this.handleAppStateChange);
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
    const { webViewStyle } = this.props;
    const { html, htmlBodyHeight } = this.state;
    const containerStyle: ViewStyle = {
      height: htmlBodyHeight
    };

    const isLoading =
      html === undefined || (html !== "" && htmlBodyHeight === 0);
    return (
      <React.Fragment>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={customVariables.brandPrimary}
            animating={true}
          />
        )}
        {/* Hide the WebView until we have the htmlBodyHeight */}
        {html && (
          <ScrollView nestedScrollEnabled={false} style={containerStyle}>
            <View style={containerStyle}>
              <WebView
                key={this.state.webviewKey}
                textZoom={100}
                ref={this.webViewRef}
                scrollEnabled={false}
                overScrollMode={"never"}
                style={webViewStyle}
                originWhitelist={["*"]}
                source={{ html, baseUrl: "" }}
                javaScriptEnabled={true}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                onLoadEnd={this.handleLoadEnd}
                onMessage={this.handleWebViewMessage}
                showsVerticalScrollIndicator={false}
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
    if (this.webViewRef.current) {
      this.webViewRef.current.injectJavaScript(NOTIFY_BODY_HEIGHT_SCRIPT);
    }
  };

  // A function that handles message sent by the WebView component
  private handleWebViewMessage = (event: WebViewMessageEvent) => {
    const { dispatch } = this.props;

    // We validate the format of the message with io-ts
    const messageOrErrors = WebViewMessage.decode(
      JSON.parse(event.nativeEvent.data)
    );

    messageOrErrors.map(message => {
      switch (message.type) {
        case "LINK_MESSAGE":
          handleLinkMessage(dispatch, message.payload.href);
          fromNullable(this.props.onLinkClicked).map(s =>
            s(message.payload.href)
          );
          break;

        case "RESIZE_MESSAGE":
          this.setState({
            htmlBodyHeight: message.payload.height
          });
          break;
      }
    });
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
    InteractionManager.runAfterInteractions(() => {
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
          error
            ? fromNullable(onError).map(_ => _(error))
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
