import I18n from "i18next";
import { InitializedProfile } from "../../../../../definitions/identity/InitializedProfile";
import { formatDateAsShortFormat } from "../../../../utils/dates";

type CgnUserAgeRange = "18-25" | "26-30" | "31-35" | "unrecognized";

export const getCgnUserAgeRange = (
  profileBDay: InitializedProfile["date_of_birth"]
): CgnUserAgeRange => {
  if (!profileBDay) {
    return "unrecognized";
  }
  const date = new Date();
  const birthDate = new Date(profileBDay);
  const age = ageFromDate(birthDate, date);
  if (age > 30) {
    return "31-35";
  } else if (age > 25) {
    return "26-30";
  } else if (age > 17) {
    return "18-25";
  }
  return "unrecognized";
};

type CGNBadgeStatus = "expired" | "active" | "revoked";

const getStatusLabel = (status: CGNBadgeStatus) => {
  switch (status) {
    case "expired":
      return I18n.t("bonus.cgn.detail.status.date.expired");
    case "active":
      return I18n.t("bonus.cgn.detail.status.expiration.cgn");
    case "revoked":
      return I18n.t("bonus.cgn.detail.status.date.revoked");
  }
};

export const getAccessibleExpirationDate = (
  expirationDate: Date,
  status: CGNBadgeStatus
) =>
  `${getStatusLabel(status)}: ${formatDateAsShortFormat(
    expirationDate
  )}. ${I18n.t("bonus.cgn.detail.status.a11y.cardStatus", {
    status: I18n.t(`bonus.cgn.detail.status.badge.${status}`)
  })}`;

const MONTH_CODES: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  H: 5,
  L: 6,
  M: 7,
  P: 8,
  R: 9,
  S: 10,
  T: 11
};

const ageFromDate = (birthDate: Date, today: Date = new Date()): number => {
  const age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  return hasBirthdayPassed ? age : age - 1;
};

const birthDateFromTaxCode = (cf: string): Date => {
  const year = Number.parseInt(cf.slice(6, 8), 10);
  const month = MONTH_CODES[cf[8]];
  const rawDay = Number.parseInt(cf.slice(9, 11), 10);
  // Women have 40 added to their day of birth in the tax code
  const day = rawDay > 40 ? rawDay - 40 : rawDay;
  const currentYear = new Date().getFullYear() % 100;
  const fullYear = (year <= currentYear ? 2000 : 1900) + year;
  return new Date(fullYear, month, day);
};

export const canAccessCgn = (profile?: InitializedProfile) => {
  if (!profile) {
    return false;
  }
  const birthDate = profile.date_of_birth
    ? new Date(profile.date_of_birth)
    : birthDateFromTaxCode(profile.fiscal_code);
  return ageFromDate(birthDate) <= 35;
};
