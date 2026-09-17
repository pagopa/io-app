import { Millisecond } from "@pagopa/ts-commons/lib/units";

export const WAIT_TIMEOUT_NAVIGATION = 1700 as Millisecond;
export const WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY = 5000 as Millisecond;

/**
 * Prefixes of the error codes reported when the WebView fails to load a page.
 * These codes end up in the support modal, in the Zendesk ticket and in the Mixpanel
 * KO event, so they must stay stable and readable to keep failures diagnosable.
 */
export const WEBVIEW_ERROR_CODE_PREFIX = "CIEID_WEBVIEW_ERROR";
export const WEBVIEW_HTTP_ERROR_CODE_PREFIX = "CIEID_WEBVIEW_HTTP_ERROR";
