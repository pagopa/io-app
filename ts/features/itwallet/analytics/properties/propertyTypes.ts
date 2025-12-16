import {
  ItwStatus,
  ItwPIDStatus,
  ItwCredentialMixpanelStatus,
  MixPanelCredential
} from "..";

export type ITWBaseProperties = {
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

export type WalletRevokedAnalyticsEvent = Record<
  MixPanelCredential,
  "not_available"
> & {
  ITW_STATUS_V2: "not_active";
};
