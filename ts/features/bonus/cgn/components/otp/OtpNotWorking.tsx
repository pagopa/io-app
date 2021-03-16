import * as React from "react";
import Markdown from "../../../../../components/ui/Markdown";
import I18n from "../../../../../i18n";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";

type Props = {
  onPress: () => void;
};

const OtpNotWorking: React.FunctionComponent<Props> = (props: Props) => (
  <>
    <Markdown>{I18n.t("bonus.cgn.otp.screen.bottomSheet.body")}</Markdown>
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={cancelButtonProps(
        props.onPress,
        I18n.t("bonus.cgn.otp.screen.bottomSheet.cta")
      )}
    />
  </>
);

export const useOtpNotWorkingBottomSheet = (onPress: () => void) =>
  useIOBottomSheet(
    <OtpNotWorking onPress={onPress} />,
    I18n.t("bonus.cgn.otp.screen.link"),
    450
  );
