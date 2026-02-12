import { CIE_PLAYGROUNDS_ROUTES } from "./routes";

export type CiePlaygroundsParamsList = {
  [CIE_PLAYGROUNDS_ROUTES.MAIN]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.ATTRIBUTES]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.CERTIFICATE_READING]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.AUTHENTICATION]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.MRTD]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH_MRTD]: undefined;
  [CIE_PLAYGROUNDS_ROUTES.RESULT]: {
    title: string;
    data: any;
    isError?: boolean;
  };
};
