import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { SnapshotFrom } from "xstate";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import { idPayUnsubscriptionMachine } from "./machine";

type MachineSnapshot = SnapshotFrom<typeof idPayUnsubscriptionMachine>;

export const selectInitiativeName = ({ context }: MachineSnapshot) =>
  context.initiativeName;

export const selectIsFailure = (snapshot: MachineSnapshot) =>
  snapshot.matches("UnsubscriptionFailure");

export const selectInitiativeType = ({ context }: MachineSnapshot) =>
  pipe(
    context.initiativeType,
    O.fromNullable,
    O.getOrElse(() => InitiativeRewardTypeEnum.REFUND)
  );

const checks = {
  [InitiativeRewardTypeEnum.REFUND]: [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.2.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.2.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.4.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.4.content")
    }
  ],

  [InitiativeRewardTypeEnum.DISCOUNT]: [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    }
  ]
};

export const selectUnsubscriptionChecks = createSelector(
  selectInitiativeType,
  type => checks[type]
);
