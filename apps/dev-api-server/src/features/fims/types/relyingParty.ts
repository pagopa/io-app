export type RelyingParty = {
  displayName: string;
  id: string;
  isInternal: boolean;
  redirectUris: ReadonlyArray<string>; // TODO use relative path (i.e. compose protocol, host, port and base path dinamically)
  responseMode: "form_post";
  responseType: "id_token";
  scopes: ReadonlyArray<"openid" | "profile">;
  serviceId: string;
};

export type RelyingPartyRequest = {
  nonce: string;
  relyingPartyId: string;
  state: string;
};
