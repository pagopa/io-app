import * as t from "io-ts";

const confirmType = t.interface({
  href: t.string
});

const linksType = t.interface({
  confirm: confirmType
});

const claimType = t.interface({
  name: t.string,
  display_name: t.string
});

const redirectionType = t.interface({
  display_name: t.string
});

export const ConsentData = t.interface({
  _links: linksType,
  service_id: t.string,
  redirection: redirectionType,
  type: t.string,
  claims: t.readonlyArray(claimType)
});

export type ConsentData = t.TypeOf<typeof ConsentData>;
