export const loginLolliPopRedirect = "/idp-login";
export const redirectUrl = "/profile.html";
export const errorRedirectUrl = "/error.html";
export const authorizePath = "/oneidentity/authorize";
export const ioRedirectPath = "/api/auth/v1/io/callback";
/**
 * Values the app sends as `idp` to the OneIdentity `/authorize` for a CIE login
 * (production and pre-production). Any other value is a SPID entity ID.
 */
export const oneIdentityCieIdpIds: ReadonlyArray<string> = [
  "https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO",
  "https://preproduzione.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO"
];

export enum AppUrlLoginScheme {
  native = "iologin",
  webview = "http"
}
