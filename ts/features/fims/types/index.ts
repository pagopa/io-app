import * as t from "io-ts";

const confirmType = t.type({
  href: t.string
});

const linksType = t.type({
  confirm: confirmType
});

const claimType = t.type({
  name: t.string,
  display_name: t.string
});

const redirectionType = t.type({
  display_name: t.string
});

export const ConsentData = t.type({
  _links: linksType,
  service_id: t.string,
  redirection: redirectionType,
  type: t.string,
  claims: t.readonlyArray(claimType)
});

export type FimsClaimType = t.TypeOf<typeof claimType>;
export type ConsentData = t.TypeOf<typeof ConsentData>;
