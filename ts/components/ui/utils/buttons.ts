import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { openWebUrl } from "../../../utils/url";

export const getInstructionsButtonConfig = (url: string) => ({
  icon: "instruction" as const,
  label: I18n.t("global.buttons.whatCanYouDo"),
  onPress: () => openWebUrl(url, () => IOToast.error(I18n.t("genericError")))
});
