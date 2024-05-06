import React from "react";
import { EuCovidCertificateRouterScreenNavigationParams } from "../screens/EuCovidCertificateRouterScreen";

export const EUCovidContext =
  React.createContext<EuCovidCertificateRouterScreenNavigationParams | null>(
    null
  );
