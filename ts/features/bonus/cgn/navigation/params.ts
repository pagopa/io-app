import { Merchant } from "../../../../../definitions/cgn/merchants/Merchant";
import { ProductCategoryEnum } from "../../../../../definitions/cgn/merchants/ProductCategory";
import CGN_ROUTES from "./routes";

export type CgnActivationParamsList = {
  [CGN_ROUTES.ACTIVATION.INFORMATION_TOS]: undefined;
  [CGN_ROUTES.ACTIVATION.LOADING]: undefined;
  [CGN_ROUTES.ACTIVATION.PENDING]: undefined;
  [CGN_ROUTES.ACTIVATION.EXISTS]: undefined;
  [CGN_ROUTES.ACTIVATION.TIMEOUT]: undefined;
  [CGN_ROUTES.ACTIVATION.INELIGIBLE]: undefined;
  [CGN_ROUTES.ACTIVATION.COMPLETED]: undefined;
  [CGN_ROUTES.ACTIVATION.CTA_START_CGN]: undefined;
};

export type CgnDetailsParamsList = {
  [CGN_ROUTES.DETAILS.DETAILS]: undefined;
  [CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES]: undefined;
  [CGN_ROUTES.DETAILS.MERCHANTS.LIST]: undefined;
  [CGN_ROUTES.DETAILS.MERCHANTS
    .LIST_BY_CATEGORY]: CgnMerchantListByCategoryScreenNavigationParams;
  [CGN_ROUTES.DETAILS.MERCHANTS.TABS]: undefined;
  [CGN_ROUTES.DETAILS.MERCHANTS
    .DETAIL]: CgnMerchantDetailScreenNavigationParams;
  [CGN_ROUTES.DETAILS.MERCHANTS
    .LANDING_WEBVIEW]: CgnMerchantLandingWebviewNavigationParams;
};

// ------------ SCREEN NAVIGATION PARAMS

export type CgnEYCAActivationParamsList = {
  [CGN_ROUTES.EYCA.ACTIVATION.LOADING]: undefined;
};

export type CgnMerchantLandingWebviewNavigationParams = Readonly<{
  landingPageUrl: string;
  landingPageReferrer: string;
}>;

export type CgnMerchantListByCategoryScreenNavigationParams = Readonly<{
  category: ProductCategoryEnum;
}>;

export type CgnMerchantDetailScreenNavigationParams = Readonly<{
  merchantID: Merchant["id"];
}>;
