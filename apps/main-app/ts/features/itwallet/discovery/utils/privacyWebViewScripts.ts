import {
  AVOID_ZOOM_JS,
  closeInjectedScript,
  GET_CONTENT_HEIGHT_SCRIPT
} from "../../../../utils/webview";

type PrivacyWebViewStyle = {
  backgroundColor: string;
  linkColor: string;
  textColor: string;
  textSizeAdjust: number;
};

export const getPrivacyWebViewScripts = ({
  backgroundColor,
  linkColor,
  textColor,
  textSizeAdjust
}: PrivacyWebViewStyle) => {
  const styleScript = `
    (function () {
      var style = document.getElementById('io-privacy-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'io-privacy-style';
        document.head.appendChild(style);
      }
      style.textContent = ${JSON.stringify(`
        html, body, body * {
          background-color: ${backgroundColor} !important;
          color: ${textColor} !important;
          -webkit-text-size-adjust: ${textSizeAdjust}% !important;
        }
        a, a * { color: ${linkColor} !important; }
      `)};
      window.dispatchEvent(new Event('resize'));
    })();
  `;

  return {
    styleScript: closeInjectedScript(styleScript),
    injectedJavaScript: closeInjectedScript(
      `${AVOID_ZOOM_JS};${styleScript};${GET_CONTENT_HEIGHT_SCRIPT}
        new ResizeObserver(sendHeight).observe(document.body);`
    )
  };
};
