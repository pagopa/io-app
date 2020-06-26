import { fromNullable, Option } from "fp-ts/lib/Option";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";
import { BonusActivationStatusEnum } from "../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { formatDateAsLocal } from "../../../utils/dates";
import { addEvery } from "../../../utils/strings";
import {
  BonusVacanzeActivationPayload,
  EligibilityCheckPayload
} from "../store/actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../store/reducers/activation";
import { EligibilityRequestProgressEnum } from "../store/reducers/eligibility";

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

const allowedEligibilityStatus = new Set([
  EligibilityRequestProgressEnum.ERROR,
  EligibilityRequestProgressEnum.TIMEOUT,
  EligibilityRequestProgressEnum.BONUS_ACTIVATION_PENDING
]);

export const isEligibilityResponseTrackable = (
  eligibility: EligibilityCheckPayload
) => allowedEligibilityStatus.has(eligibility.status);

const allowedActivationStatus = new Set([
  BonusActivationProgressEnum.ERROR,
  BonusActivationProgressEnum.TIMEOUT,
  BonusActivationProgressEnum.SUCCESS
]);

export const isActivationResponseTrackable = (
  eligibility: BonusVacanzeActivationPayload
) => allowedActivationStatus.has(eligibility.status);
