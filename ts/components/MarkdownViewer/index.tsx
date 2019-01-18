import React from "react";
import { InteractionManager, StyleProp, View, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { connect } from "react-redux";
import remark from "remark";
import remarkCustomBlocks from "remark-custom-blocks";
import remarkHtml from "remark-html";

import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";
import { handleInternalLink } from "./handlers/internalLink";
import {
  NOTIFY_BODY_HEIGHT_SCRIPT,
  NOTIFY_INTERNAL_LINK_CLICK_SCRIPT
} from "./script";
import { WebViewMessage } from "./types";

// Configuration fo remark-custom-blocks
const REMARK_CUSTOM_BLOCKS_CONFIG = {
  "IO-DEMO": {
    classes: "io-block-demo"
  }
};

const COMPILE_ERROR_HTML = `<p>${I18n.t("global.markdown.decodeError")}<p>`;

const INJECTED_JAVASCRIPT = `
${NOTIFY_INTERNAL_LINK_CLICK_SCRIPT}
`;

const INLINE_CSS = `
<style>
body {
  margin: 0;
  padding: 0;
  font-size: 16px;
}
</style>
`;

const generateHtml = (content: string, htmlBodyClasses?: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  <head>
  <body class="${htmlBodyClasses || ""}">
  ${INLINE_CSS}
  ${content}
  </body>
  </html>
  `;
};

type OwnProps = {
  markdown: string;
  // Space separated classes (ex. "message demo")
  htmlBodyClasses?: string;
  webViewStyle?: StyleProp<ViewStyle>;
};

type Props = OwnProps & ReduxProps;

type State = {
  html: string | undefined;
  htmlBodyHeight: number;
};

class MarkdownViewer extends React.PureComponent<Props, State> {
  private webViewRef = React.createRef<WebView>();

  constructor(props: Props) {
    super(props);
    this.state = {
      html: undefined,
      htmlBodyHeight: 0
    };
  }

  public componentDidMount() {
    const { markdown, htmlBodyClasses } = this.props;

    this.compileMarkdownAsync(markdown, htmlBodyClasses);
  }

  public componentDidUpdate(prevProps: Props) {
    const { markdown: prevMarkdown } = prevProps;
    const { markdown, htmlBodyClasses } = this.props;

    // If the markdown changes we need to re-compile it
    if (markdown !== prevMarkdown) {
      this.compileMarkdownAsync(markdown, htmlBodyClasses);
    }
  }

  public render() {
    const { webViewStyle } = this.props;
    const { html, htmlBodyHeight } = this.state;

    // Hide the WebView until we have the htmlBodyHeight
    const containerStyle: ViewStyle =
      htmlBodyHeight === 0
        ? {
            height: 0
          }
        : {
            height: htmlBodyHeight
          };

    return (
      <View style={containerStyle}>
        <WebView
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
        />
      </View>
    );
  }

  // When the injected html is loaded inject the script to notify the height
  private handleLoadEnd = () => {
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

    if (messageOrErrors.isRight()) {
      const message = messageOrErrors.value;

      switch (message.type) {
        case "LINK_MESSAGE":
          handleInternalLink(dispatch, message.payload.href);
          break;

        case "RESIZE_MESSAGE":
          this.setState({
            htmlBodyHeight: message.payload.height
          });
          break;

        default:
          break;
      }
    }
  };

  // A function that uses remark to compile the markdown to html
  private compileMarkdownAsync = (
    markdown: string,
    htmlBodyClasses?: string
  ) => {
    InteractionManager.runAfterInteractions(() => {
      remark()
        .use(remarkCustomBlocks, REMARK_CUSTOM_BLOCKS_CONFIG)
        .use(remarkHtml)
        .process(markdown, (error: any, file: any) => {
          const html = error
            ? COMPILE_ERROR_HTML
            : generateHtml(String(file), htmlBodyClasses);
          this.setState({ html });
        });
    });
  };
}

export default connect()(MarkdownViewer);
