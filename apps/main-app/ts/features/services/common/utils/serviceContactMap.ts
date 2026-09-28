import { ServiceMetadata } from "@io-app/api-types/generated/definitions/services/ServiceMetadata";
import { IOIcons } from "@io-app/design-system";
import I18n from "i18next";

import { handleItemOnPress } from "../../../../utils/url";

type ServiceContact = {
  accessibilityLabel: () => string;
  icon: IOIcons;
  label: () => string;
  openContact: (value: string) => void;
};

export const serviceContactMap = {
  web_url: {
    accessibilityLabel: () => I18n.t("services.contacts.a11y.website"),
    icon: "website",
    label: () => I18n.t("services.contacts.website"),
    openContact: value => handleItemOnPress(value)()
  },
  app_android: {
    accessibilityLabel: () => I18n.t("services.contacts.downloadApp"),
    icon: "device",
    label: () => I18n.t("services.contacts.downloadApp"),
    openContact: value => handleItemOnPress(value)()
  },
  app_ios: {
    accessibilityLabel: () => I18n.t("services.contacts.downloadApp"),
    icon: "device",
    label: () => I18n.t("services.contacts.downloadApp"),
    openContact: value => handleItemOnPress(value)()
  },
  support_url: {
    accessibilityLabel: () => I18n.t("services.contacts.support"),
    icon: "chat",
    label: () => I18n.t("services.contacts.support"),
    openContact: value => handleItemOnPress(value)()
  },
  phone: {
    accessibilityLabel: () => I18n.t("services.contacts.phone"),
    icon: "phone",
    label: () => I18n.t("services.contacts.phone"),
    openContact: value => handleItemOnPress(`tel:${value}`)()
  },
  email: {
    accessibilityLabel: () => I18n.t("services.contacts.email"),
    icon: "email",
    label: () => I18n.t("services.contacts.email"),
    openContact: value => handleItemOnPress(`mailto:${value}`)()
  },
  pec: {
    accessibilityLabel: () => I18n.t("services.contacts.pec"),
    icon: "pec",
    label: () => I18n.t("services.contacts.pec"),
    openContact: value => handleItemOnPress(`mailto:${value}`)()
  }
} satisfies Partial<Record<keyof ServiceMetadata, ServiceContact>>;

export type ServiceContactField = keyof typeof serviceContactMap;
