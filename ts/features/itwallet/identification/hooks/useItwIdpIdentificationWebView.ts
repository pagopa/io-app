import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import React from "react";
import { LocalIdpsFallback } from "../../../../utils/idps";

export const useItwIdpIdentificationWebView = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const startIdentification = (idp: LocalIdpsFallback) => {
    if (isLoading) {
      return;
    }

    void openAuthenticationSession("", "");
  };

  return {
    startIdentification,
    isLoading
  };
};
