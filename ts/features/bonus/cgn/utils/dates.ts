import { InitializedProfile } from "../../../../../definitions/auth/InitializedProfile";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";

type CgnUserAgeRange = "18-25" | "26-30" | "31-35" | "unrecognized";

export const getCgnUserAgeRange = (
  profileBDay: InitializedProfile["date_of_birth"]
): CgnUserAgeRange => {
  if (profileBDay) {
    const date = new Date();
    const birthDate = new Date(profileBDay);
    const age = date.getFullYear() - birthDate.getFullYear();

    if (age > 30) {
      return "31-35";
    } else if (age > 25) {
      return "26-30";
    } else if (age > 17) {
      return "18-25";
    }
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
  `${getStatusLabel(status)}: ${localeDateFormat(
    expirationDate,
    I18n.t("global.dateFormats.shortFormat")
  )}. ${I18n.t("bonus.cgn.detail.status.a11y.cardStatus", {
    status: I18n.t(`bonus.cgn.detail.status.badge.${status}`)
  })}`;
