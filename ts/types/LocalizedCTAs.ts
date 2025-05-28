/**
 * this type models 2 cta that could be nested inside the markdown content of a message and on a service
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
export type CTAS = t.TypeOf<typeof CTAS>;

const props = {
  it: CTAS,
  en: CTAS
};
const LocalizedCTAs = t.partial(props);
export type LocalizedCTAs = t.TypeOf<typeof LocalizedCTAs>;

export const LocalizedCTALocales = t.keyof(props);
export type LocalizedCTALocales = t.TypeOf<typeof LocalizedCTALocales>;
