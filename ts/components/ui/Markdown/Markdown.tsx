import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  InteractionManager,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleProp,
  UIManager,
  View,
  ViewStyle
} from "react-native";
import WebView from "react-native-webview";
import { filterXSS } from "xss";
import { closeInjectedScript } from "../../../utils/webview";
import { remarkProcessor } from "../../../utils/markdown";
import { MarkdownWebviewComponent } from "./MarkdownWebviewComponent";
import { NOTIFY_BODY_HEIGHT_SCRIPT, NOTIFY_LINK_CLICK_SCRIPT } from "./script";
import { LoadingSkeleton } from "./../LoadingSkeleton";
import { convertOldDemoMarkdownTag, generateHtml } from "./utils";

export type MarkdownProps = {
  animated?: boolean;
  /**
   * The code will be inserted in the html body between
   * <script> and </script> tags.
   */
  avoidTextSelection?: true;
  children: string;
  cssStyle?: string;
  extraBodyHeight?: number;
  letUserZoom?: boolean;
  loadingLines?: number;
  onError?: (error: any) => void;
  onLinkClicked?: (url: string) => void;
  onLoadEnd?: () => void;
  /**
   * if shouldHandleLink returns true the clicked link will be handled by the Markdown component
   * otherwise Markdown will ignore it. If shouldHandleLink is not defined assume () => true
   * @param url
   */
  shouldHandleLink?: (url: string) => boolean;
  testID?: string;
  webViewStyle?: StyleProp<ViewStyle>;
  useCustomSortedList?: boolean;
};

type InternalState = {
  html?: string;
  htmlBodyHeight: number;
  isLoading: boolean;
  webviewKey: number;
};

export const Markdown = (props: MarkdownProps) => {
  const [internalState, setInternalState] = useState<InternalState>({
    html: undefined,
    htmlBodyHeight: 0,
    isLoading: true,
    webviewKey: 0
  });
  const webViewRef = useRef<WebView>(null);
  const { html, htmlBodyHeight, isLoading, webviewKey } = internalState;
  const containerStyle: ViewStyle = {
    height: htmlBodyHeight + (props.extraBodyHeight || 0)
  };
  const handleLoadEnd = useCallback(() => {
    props.onLoadEnd?.();
    setTimeout(() => {
      // to avoid yellow box warning
      // it's ugly but it works https://github.com/react-native-community/react-native-webview/issues/341#issuecomment-466639820
      webViewRef.current?.injectJavaScript(
        closeInjectedScript(NOTIFY_BODY_HEIGHT_SCRIPT)
      );
    }, 100);
  }, [props]);

  const compileMarkdownAsync = useCallback(
    (
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
            if (error) {
              onError?.(error);
              return;
            }
            // The check below on `isLoading` is to set the property back to 'false'
            // value when refreshing with metro, since it is set back to the initial
            // 'true' value but the underlying MarkdownWebviewComponent does not
            // reload its content (the html is recompiled but it does not change),
            // thus, not calling the `handleLoadEnd` callback
            const generatedHtml = generateHtml(
              String(file),
              cssStyle,
              useCustomSortedList,
              avoidTextSelection
            );
            setInternalState(currentInternalState => ({
              ...currentInternalState,
              isLoading:
                currentInternalState.isLoading &&
                currentInternalState.html !== generatedHtml,
              html: generatedHtml
            }));
          }
        );
      });
    },
    []
  );

  useEffect(() => {
    setInternalState(currentInternalState => ({
      ...currentInternalState,
      isLoading: true
    }));
    compileMarkdownAsync(
      props.children,
      props.animated,
      props.onError,
      props.cssStyle,
      props.useCustomSortedList,
      props.avoidTextSelection
    );

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (Platform.OS === "ios" && nextAppState === "active") {
          // Reloads the WebView on iOS. Using reload() on the webview
          // reference causes the injected javascript to fail
          setInternalState(currentInternalState => ({
            ...currentInternalState,
            webviewKey: currentInternalState.webviewKey + 1
          }));
        }
      }
    );
    return () => subscription.remove();
  }, [compileMarkdownAsync, props]);

  return (
    <>
      {isLoading && (
        <LoadingSkeleton lines={props.loadingLines} testID={props.testID} />
      )}
      {/* Hide the WebView until we have the htmlBodyHeight */}
      {html && (
        <ScrollView nestedScrollEnabled={false} style={containerStyle}>
          <View style={containerStyle}>
            <MarkdownWebviewComponent
              injectedJavascript={NOTIFY_LINK_CLICK_SCRIPT}
              handleLoadEnd={handleLoadEnd}
              shouldHandleLink={props.shouldHandleLink}
              html={html}
              webviewKey={webviewKey}
              webViewRef={webViewRef}
              setLoadingFalse={() =>
                setInternalState(currentInternalState => ({
                  ...currentInternalState,
                  isLoading: false
                }))
              }
              setHtmlBodyHeight={(inputHtmlBodyHeight: number) =>
                setInternalState(currentInternalState => ({
                  ...currentInternalState,
                  htmlBodyHeight: inputHtmlBodyHeight
                }))
              }
              webViewStyle={props.webViewStyle}
              onLinkClicked={props.onLinkClicked}
              letUserZoom={props.letUserZoom}
              testID={props.testID}
            />
          </View>
        </ScrollView>
      )}
    </>
  );
};
