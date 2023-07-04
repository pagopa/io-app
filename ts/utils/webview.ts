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

export const APP_EVENT_HANDLER = `
function sendMessagesToRN(message) {
  if (message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    return;
  }
  console.error("Specify a message to send");
}

function closeModal() {
  const message = {
    type: "CLOSE_MODAL"
  };
  sendMessagesToRN(message);
}

function showLoader() {
  const message = {
    type: "START_LOAD"
  };
  sendMessagesToRN(message);
}

function hideLoader() {
  const message = {
    type: "END_LOAD"
  };
  sendMessagesToRN(message);
}

function showSuccess(payload) {
  const message = {
    type: "SHOW_SUCCESS",
    ...payload
  };
  sendMessagesToRN(message);
}

function showErrorMessage(payload) {
  const message = {
    type: "SHOW_ERROR",
    ...payload
  };
  sendMessagesToRN(message);
}

function showAlertBox(payload) {
  const message = {
    type: "SHOW_ALERT",
    ...payload
  };
  sendMessagesToRN(message);
}

function setTitle(payload) {
  const message = {
    type: "SET_TITLE",
    ...payload
  };
  sendMessagesToRN(message);
}

function checkInjectionCompleted() {
  if(typeof onInjectionCompleted === 'function') {
    onInjectionCompleted();
  }
}

checkInjectionCompleted();
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
