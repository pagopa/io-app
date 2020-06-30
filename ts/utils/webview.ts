export const AVOID_ZOOM_JS = `
const meta = document.createElement('meta');
meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);`;

export const ON_SCROLL_END_LISTENER = `window.onscroll=function(){
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      const message = {
          type: "SCROLL_END_MESSAGE"
        };
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
};`;

const endTrue = "true;";
// ensure the injected JS into the webview contains the right closure. If not it will be added.
export const closeInjectedScript = (injection: string) => {
  const minimized = injection.replace(/  |\r\n|\n|\r/gm, "");
  const closeEnd = minimized.endsWith(";") ? minimized : minimized + ";";
  if (closeEnd.endsWith(endTrue)) {
    return minimized;
  }
  return closeEnd + endTrue;
};
