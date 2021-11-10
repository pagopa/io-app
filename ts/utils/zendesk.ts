import ZendDesk from "io-react-native-zendesk";

export type ZendeskConfig = {
  key: string;
  appId: string;
  clientId: string;
  url: string;
  token: string;
};

export const zendeskDefaultJwtConfig: ZendeskConfig = {
  key: "6e2c01f7-cebc-4c77-b878-3ed3c749a835",
  appId: "7f23d5b0eadc5b4f2cc83df3898c6f607bad769fe053a186",
  clientId: "mobile_sdk_client_4bf774ed28b085195cc5",
  url: "https://appio.zendesk.com",
  token: ""
};
export const zendeskDefaultAnonymousConfig: ZendeskConfig = {
  key: "6e2c01f7-cebc-4c77-b878-3ed3c749a835",
  appId: "8547479b47fdacd0e8f74a4fb076a41014dee620d1d890b3",
  clientId: "mobile_sdk_client_518ee6a8160220698f97",
  url: "https://appio.zendesk.com",
  token: ""
};

export const initZendesk = (zendeskConfig: ZendeskConfig) => {
  ZendDesk.init({
    key: zendeskConfig.key,
    appId: zendeskConfig.appId,
    url: zendeskConfig.url,
    clientId: zendeskConfig.clientId
  });
};
