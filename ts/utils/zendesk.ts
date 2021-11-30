import ZendDesk from "io-react-native-zendesk";

export type ZendeskConfig = {
  key: string;
  appId: string;
  clientId: string;
  url: string;
  token?: string;
};

export const zendeskDefaultJwtConfig: ZendeskConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "7f23d5b0eadc5b4f2cc83df3898c6f607bad769fe053a186",
  clientId: "mobile_sdk_client_4bf774ed28b085195cc5",
  url: "https://appiotest.zendesk.com"
};
export const zendeskDefaultAnonymousConfig: ZendeskConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "8547479b47fdacd0e8f74a4fb076a41014dee620d1d890b3",
  clientId: "mobile_sdk_client_518ee6a8160220698f97",
  url: "https://appiotest.zendesk.com"
};

export const initSupportAssistance = (zendeskConfig: ZendeskConfig) => {
  ZendDesk.init({
    key: zendeskConfig.key,
    appId: zendeskConfig.appId,
    url: zendeskConfig.url,
    clientId: zendeskConfig.clientId
  });
};
