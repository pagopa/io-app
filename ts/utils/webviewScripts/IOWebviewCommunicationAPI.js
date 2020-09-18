/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 * An Object to define the values of Title and description of an alert box.
 *
 * @typedef {Object} AlertContents
 * @property {string} title - The title of the alert box.
 * @property {string} description - The main message of the alert box.
 */

/**
 * An object defined for internationalization purpose.
 * The key is the language key and the value is the message text
 *
 * Accepted keys:
 * - it
 * - en
 * @typedef {Object} MessagePayloadS
 * @property {string} it - The message defined in Italian.
 * @property {string} en - The message defined in English.
 */

/**
 * An object defined for internationalization purpose.
 * The key is the language key and the value is the payload for alert box
 *
 * @typedef {Object} MessagePayloadL
 * @property {AlertContent} it - The values of the alert box in Italian language
 * @property {AlertContent} en - The values of the alert box in English language
 */

// /**
//  * The object that defines the data exchange between IO App and webpage layers.
//  *
//  * @typedef {Object} Message
//  * @property {string} type - The values of the alert box in Italian language
//  * @property {(...MessagePayloadL|...MessagePayloadS)} - (Optional) The values of the alert box in English language
//  */

// /**
//  * This function sends messages to IO app layer.
//  *
//  * @param {Message} message
//  */
function sendMessagesToRN(message) {
  if (message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    return;
  }
  console.error("Specify a message to send");
}

/**
 * This function sends to IO App the input to show the activity indicator loader.
 */
function closeModal() {
  const message = {
    type: "CLOSE_MODAL"
  };
  sendMessagesToRN(message);
}

/**
 * This function sends to IO App the input to show the activity indicator loader.
 */
function showLoader() {
  const message = {
    type: "START_LOAD"
  };
  sendMessagesToRN(message);
}

/**
 * This function sends to IO App the input to hide the activity indicator loader.
 */
function hideLoader() {
  const message = {
    type: "END_LOAD"
  };
  sendMessagesToRN(message);
}

/**
 * A function to show the success component on the IO App side.
 *
 * @param {MessagePayloadS} payload - Will be the message showed in the success screen, otherwise a common text will be displayed
 */
function showSuccess(payload) {
  const message = {
    type: "SHOW_SUCCESS",
    ...payload
  };
  sendMessagesToRN(message);
}

/**
 * A function to send an error message to IO App component
 *
 * @param {MessagePayloadS} payload
 */
function showErrorMessage(payload) {
  const message = {
    type: "SHOW_ERROR",
    ...payload
  };
  sendMessagesToRN(message);
}

/**
 * A function to show an AlertBox in the IO App component.
 *
 * @param {MessagePayloadL} payload - the value to display in the alert box.
 */
function showAlertBox(payload) {
  const message = {
    type: "SHOW_ALERT",
    ...payload
  };
  sendMessagesToRN(message);
}

/**
 * This is a utility function to check if the injection is yet completed.
 * This calls onInjectionCompleted function which is implemented by the client and not injected by IO App.
 */
function checkInjectionCompleted() {
  if (typeof onInjectionCompleted === "function") {
    onInjectionCompleted();
  }
}

checkInjectionCompleted();
