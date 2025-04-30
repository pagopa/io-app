import { EmailString, FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { InitializedProfile } from "../../definitions/auth/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../definitions/auth/ServicesPreferencesMode";
import { Version } from "../../definitions/auth/Version";

const mockedProfile: InitializedProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  email: "test@example.com" as EmailString,
  family_name: "Connor",
  fiscal_code: "ABCDEF83A12L719R" as FiscalCode,
  has_profile: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_inbox_enabled: true,
  is_webhook_enabled: true,
  is_email_already_taken: false,
  name: "John",
  spid_email: "test@example.com" as EmailString,
  version: 1 as Version
};

export default mockedProfile;
