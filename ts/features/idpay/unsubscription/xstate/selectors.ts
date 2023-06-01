import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import { LOADING_TAG } from "../../../../utils/xstate";
import { IDPayUnsubscriptionMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayUnsubscriptionMachineType>;

export const selectInitiativeName = (state: StateWithContext) =>
  state.context.initiativeName;

const selectTags = (state: StateWithContext) => state.tags;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);

export const selectIsFailure = (state: StateWithContext) =>
  state.matches("UNSUBSCRIPTION_FAILURE");

export const selectInitiativeType = (state: StateWithContext) =>
  pipe(
    state.context.initiativeType,
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
