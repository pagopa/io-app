import { SvVoucher } from "./types/SvVoucher";
import I18n from "../../../i18n";

export const fromVoucherToDestinationLabels = (voucher: SvVoucher) => {
  switch (voucher.category) {
    case "student":
      return [
        {
          label: I18n.t("bonus.sv.components.destinationLabels.universityName"),
          value: voucher.university.universityName
        },
        {
          label: I18n.t("bonus.sv.components.destinationLabels.municipality"),
          value: voucher.university.municipality.name
        }
      ];
    case "worker":
      return [
        {
          label: I18n.t("bonus.sv.components.destinationLabels.companyName"),
          value: voucher.company.businessName
        },
        {
          label: I18n.t("bonus.sv.components.destinationLabels.municipality"),
          value: voucher.company.municipality.name
        }
      ];
    case "sick":
      return [
        {
          label: I18n.t("bonus.sv.components.destinationLabels.hospitalName"),
          value: voucher.hospital.hospitalName
        },
        {
          label: I18n.t("bonus.sv.components.destinationLabels.municipality"),
          value: voucher.hospital.municipality.name
        }
      ];
  }
  return [];
};
