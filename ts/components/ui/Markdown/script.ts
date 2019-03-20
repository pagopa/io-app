/**
 * This file contains all the JS scripts used by the Markdown component.
 */

// Javascript to detect link click and generate window LINK_MESSAGE
export const NOTIFY_LINK_CLICK_SCRIPT = `
function findParent(tagname, el) {
  while (el) {
    if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

document.body.onclick = function(e) {
  e = e || event;
  const from = findParent("a", e.target || e.srcElement);
  if (from) {
    const href = from.href;
    const message = {
      type: "LINK_MESSAGE",
      payload: {
        href
      }
    };
    window.postMessage(JSON.stringify(message));
    return false;
  }
};

true
`;

// Script to notify the height of the body to the react WebView component
export const NOTIFY_BODY_HEIGHT_SCRIPT = `
const message = {
  type: "RESIZE_MESSAGE",
  payload: {
    height: document.body.scrollHeight
  }
};
window.postMessage(JSON.stringify(message));

true
`;
