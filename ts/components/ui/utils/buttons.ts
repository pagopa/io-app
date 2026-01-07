import {
  IOButtonBlockSpecificProps,
  IOToast
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { openWebUrl } from "../../../utils/url";
import { OperationResultScreenContentProps } from "../../screens/OperationResultScreenContent";

export type ButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "fullWidth" | "variant"
>;
export const getInstructionsButtonConfig = (
  url: string
): OperationResultScreenContentProps["secondaryAction"] => ({
  icon: "instruction",
  label: I18n.t("global.buttons.whatCanYouDo"),
  onPress: () => openWebUrl(url, () => IOToast.error(I18n.t("genericError")))
});
