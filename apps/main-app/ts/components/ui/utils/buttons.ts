import { IOButtonBlockSpecificProps, IOToast } from "@io-app/design-system";
import I18n from "i18next";

import { GuidedTourProps } from "../../../features/tour/components/GuidedTour";
import { openWebUrl } from "../../../utils/url";
import { OperationResultScreenContentProps } from "../../screens/OperationResultScreenContent";

export type ButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "fullWidth" | "variant"
>;

export type ButtonBlockWithTourGuideProps = ButtonBlockProps & {
  tourGuideProps?: GuidedTourProps;
};

export const getInstructionsButtonConfig = (
  url: string
): OperationResultScreenContentProps["secondaryAction"] => ({
  icon: "instruction",
  label: I18n.t("global.buttons.whatCanYouDo"),
  onPress: () => openWebUrl(url, () => IOToast.error(I18n.t("genericError")))
});
