import * as t from "io-ts";

const LocalizedMessage = t.interface({
  "en-EN": t.string,
  "it-IT": t.string
});

const BackendStatusR = t.interface({
  is_alive: t.boolean,
  message: LocalizedMessage
});

const Levels = t.keyof({
  critical: null,
  normal: null,
  warning: null
});

// SectionStatus represents the status of a single section
const SectionStatusR = t.interface({
  is_visible: t.boolean,
  level: Levels,
  message: LocalizedMessage
});

const SectionStatusO = t.partial({
  badge: LocalizedMessage,
  web_url: LocalizedMessage
});

export const SectionStatus = t.intersection(
  [SectionStatusR, SectionStatusO],
  "SectionStatus"
);
export type SectionStatus = t.TypeOf<typeof SectionStatus>;

const Sections = t.interface({
  bancomat: SectionStatus,
  bancomatpay: SectionStatus,
  cashback: SectionStatus,
  credit_card: SectionStatus,
  digital_payments: SectionStatus,
  email_validation: SectionStatus,
  ingress: SectionStatus,
  login: SectionStatus,
  messages: SectionStatus,
  satispay: SectionStatus,
  services: SectionStatus,
  wallets: SectionStatus
});
export type Sections = t.TypeOf<typeof Sections>;
const BackendStatusO = t.partial({
  sections: Sections
});

export const BackendStatus = t.intersection(
  [BackendStatusR, BackendStatusO],
  "BackendStatus"
);
export type SectionStatusKey = keyof Sections;
export type BackendStatus = t.TypeOf<typeof BackendStatus>;
