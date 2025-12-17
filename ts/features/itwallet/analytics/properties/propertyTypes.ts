import { ItwStatus, ItwPIDStatus, ItwCredentialMixpanelStatus } from "..";

export type ItwBaseProperties = {
  ITW_STATUS_V2: ItwStatus;
  ITW_ID_V2?: ItwPIDStatus;
  ITW_PID: ItwPIDStatus;
  ITW_PG_V2?: ItwCredentialMixpanelStatus;
  ITW_TS_V2?: ItwCredentialMixpanelStatus;
  ITW_CED_V2?: ItwCredentialMixpanelStatus;
  ITW_PG_V3: ItwCredentialMixpanelStatus;
  ITW_TS_V3: ItwCredentialMixpanelStatus;
  ITW_CED_V3: ItwCredentialMixpanelStatus;
};

export const ITW_ANALYTICS_CREDENTIALS = [
  "ITW_ID_V2",
  "ITW_PG_V2",
  "ITW_TS_V2",
  "ITW_CED_V2",
  "ITW_PID",
  "ITW_PG_V3",
  "ITW_TS_V3",
  "ITW_CED_V3"
] as const;

export type ItwAnalyticsCredential = (typeof ITW_ANALYTICS_CREDENTIALS)[number];

export type WalletRevokedAnalyticsEvent = Record<
ItwAnalyticsCredential,
  "not_available"
> & {
  ITW_STATUS_V2: "not_active";
};
