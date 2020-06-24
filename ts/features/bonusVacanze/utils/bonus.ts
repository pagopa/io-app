import { fromNullable, Option } from "fp-ts/lib/Option";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";
import { BonusActivationStatusEnum } from "../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { EligibilityCheckSuccessEligible } from "../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { format, formatDateAsLocal } from "../../../utils/dates";
import { addEvery } from "../../../utils/strings";
import { EligibilityCheckPayload } from "../store/actions/bonusVacanze";

export const ID_BONUS_VACANZE_TYPE = 1;

// return true if the bonus is active
export const isBonusActive = (bonus: BonusActivationWithQrCode) =>
  bonus.status === BonusActivationStatusEnum.ACTIVE;

/**
 * if bonusValidityFrom and bonusValidityTo are valid it returns a tuple of 2 strings
 * representing these dates
 * @param bonusValidityFrom
 * @param bonusValidityTo
 */
export const validityInterval = (
  bonusValidityFrom?: Date,
  bonusValidityTo?: Date
): Option<ITuple2<string, string>> =>
  fromNullable(bonusValidityFrom)
    .map(vf => formatDateAsLocal(vf, true))
    .chain(vfs =>
      fromNullable(bonusValidityTo)
        .map(vt => formatDateAsLocal(vt, true))
        .map(vts => Tuple2(vfs, vts))
    );

/**
 * return the bonus code with a space every 4 chars
 * i.e. ABCDEFGH -> ABCD EFGH
 * @param bonus
 */
export const getBonusCodeFormatted = (
  bonus: BonusActivationWithQrCode
): string => addEvery(bonus.id, " ", 4).trim();

export const getAnalyticsBonusRepresentation = (
  bonus: BonusActivationWithQrCode
) => ({
  bonus_status: bonus.status,
  created_at: format(bonus.created_at),
  redeemed_at: bonus.redeemed_at ? format(bonus.redeemed_at) : "-"
});

export const getAnalyticsEligibilityRepresentation = (
  eligibility: EligibilityCheckPayload
) =>
  EligibilityCheckSuccessEligible.is(eligibility)
    ? {
        id: eligibility.id,
        max_amount: eligibility.dsu_request.max_amount,
        max_tax_benefit: eligibility.dsu_request.max_tax_benefit,
        has_discrepancies: eligibility.dsu_request.has_discrepancies,
        dsu_created_at: eligibility.dsu_request.dsu_created_at,
        family_members_count: eligibility.dsu_request.family_members.length
      }
    : {};
