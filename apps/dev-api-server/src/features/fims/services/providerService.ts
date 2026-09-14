import escapeHTML from "escape-html";

import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { ProviderConfig } from "../types/config";

export const providerConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): ProviderConfig => config.features.fims.provider;

export const baseProviderPath = () => "/fims/provider";

export const generateIdTokenRedirectHTML = (
  redirectUrl: string,
  idToken: string,
  relyingPartyState: string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FIMS Provider: submit callback</title>
  <script>document.addEventListener('DOMContentLoaded', function () { document.forms[0].submit() });</script>
</head>
<body>
  <form method="post" action="${escapeHTML(redirectUrl)}">
    <input type="hidden" name="id_token" value="${escapeHTML(idToken)}"/>
    <input type="hidden" name="state" value="${escapeHTML(relyingPartyState)}"/>
    <noscript>Your browser does not support JavaScript or you've disabled it.<br/>
      <button autofocus type="submit">Continue</button>
    </noscript>
  </form>
</body>
</html>
`;

export const translationForScope = (scope: string) => {
  if (scope.toLowerCase() === "openid") {
    return "ID";
  } else if (scope.toLowerCase() === "profile") {
    return "Name and Surname";
  }
  return scope;
};
