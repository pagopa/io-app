export type InteractionData = {
  interaction: string;
  interactionResume: string;
  interactionResumeSignature: string;
  interactionSignature: string;
};

export type OIdCData = {
  firstInteraction?: InteractionData;
  id: () => string;
  nonce: string;
  redirectUri: string;
  relyingPartyId: string;
  scopes: ReadonlyArray<string>;
  secondInteraction?: InteractionData;
  session?: SessionData;
  state: string;
};

export type OIDCErrorCodes =
  | "access_denied"
  | "invalid_scope"
  | "server_error"
  | "temporarily_unavailable"
  | "unauthorized_client"
  | "unsupported_response_type";

export type SessionData = {
  session: string;
  sessionLegacy: string;
  sessionLegacySignature: string;
  sessionSignature: string;
};
