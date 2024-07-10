import * as t from "io-ts";

const singleLinkType = t.type({
  href: t.string
});

const linksType = t.type({
  abort: singleLinkType,
  consent: singleLinkType
});

const claimType = t.partial({
  name: t.string,
  display_name: t.string
});

const redirectionType = t.partial({
  display_name: t.string
});

export const ConsentData = t.type({
  _links: linksType,
  service_id: t.string,
  redirect: redirectionType,
  type: t.string,
  user_metadata: t.readonlyArray(claimType)
});

export type FimsClaimType = t.TypeOf<typeof claimType>;
export type ConsentData = t.TypeOf<typeof ConsentData>;
