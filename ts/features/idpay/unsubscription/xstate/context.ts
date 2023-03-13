import * as O from "fp-ts/lib/Option";
import I18n from "../../../../i18n";

type UnsubscriptionCheck = {
  title: string;
  subtitle: string;
  value: boolean;
};

export type Context = {
  initiativeId: O.Option<string>;
  initiativeName?: string;
  checks: ReadonlyArray<UnsubscriptionCheck>;
};

export const INITIAL_CONTEXT: Context = {
  initiativeId: O.none,
  checks: [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content"),
      value: false
    },
    {
      title: I18n.t("idpay.unsubscription.checks.2.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.2.content"),
      value: false
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content"),
      value: false
    },
    {
      title: I18n.t("idpay.unsubscription.checks.4.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.4.content"),
      value: false
    }
  ]
};
