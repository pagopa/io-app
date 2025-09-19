export const AVOID_ZOOM_JS = `
const meta = document.createElement('meta');
meta.setAttribute('content', 'width=device-width, initial-scale=0.99, maximum-scale=0.99, user-scalable=0');
meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);`;

export const ON_SCROLL_END_LISTENER = `window.onscroll=function(){
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      const message = {
          type: "SCROLL_END_MESSAGE"
        };
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
};`;

/**
 * This script listens to load and resize events to get the height
 * and also has a fallback timeout to send the height after 300ms
 */
export const GET_CONTENT_HEIGHT_SCRIPT = `
function sendHeight() {
  const height = document.body.scrollHeight;
  window.ReactNativeWebView.postMessage(height);
}
window.addEventListener("load", sendHeight);
window.addEventListener("resize", sendHeight);
setTimeout(sendHeight, 300); // fallback
`;

const endTrue = "true;";
// ensure the injected JS into the webview contains the right closure. If not it will be added.
export const closeInjectedScript = (injection: string) => {
  const minimized = injection.replace(/ {2}|\r\n|\n|\r/gm, "");
  const closeEnd = minimized.endsWith(";") ? minimized : minimized + ";";
  if (closeEnd.endsWith(endTrue)) {
    return minimized;
  }
  return closeEnd + endTrue;
};
