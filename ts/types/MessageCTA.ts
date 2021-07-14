/**
 * this type models 2 cta that could be nested inside the markdown content of a message
 * see https://www.pivotaltracker.com/story/show/173171577
 */
import * as t from "io-ts";

const CTA = t.interface({
  text: t.string,
  action: t.string
});
export type CTA = t.TypeOf<typeof CTA>;
const CTASR = t.interface({
  cta_1: CTA
});

const CTASO = t.partial({
  cta_2: CTA
});

export const CTAS = t.intersection([CTASR, CTASO], "CTAS");

const MessageCTA = t.partial({
  it: CTAS,
  en: CTAS
});
export type CTAS = t.TypeOf<typeof CTAS>;

export type MessageCTA = t.TypeOf<typeof MessageCTA>;
