import * as React from "react";
import { View } from "native-base";
import I18n from "../../../../../i18n";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../components/core/typography/Label";
import { H4 } from "../../../../../components/core/typography/H4";
import { useIOBottomSheet } from "../../../../../utils/hooks/bottomSheet";

type Props = {
  onPress: () => void;
};

const OtpNotWorking = (props: Props) => (
  <>
    <View spacer />
    <H4 weight={"Regular"}>
      {I18n.t("bonus.cgn.otp.screen.bottomSheet.body.text1")}
      <H4>{I18n.t("bonus.cgn.otp.screen.bottomSheet.body.text2")}</H4>
    </H4>
    <View spacer />
    <H4 weight={"Regular"}>
      {I18n.t("bonus.cgn.otp.screen.bottomSheet.body.text3")}
    </H4>
    <View spacer />
    <H4 weight={"Regular"}>
      {I18n.t("bonus.cgn.otp.screen.bottomSheet.body.text4")}
    </H4>
    <View spacer={true} />
    <ButtonDefaultOpacity
      style={{ width: "100%" }}
      bordered={true}
      onPress={props.onPress}
      onPressWithGestureHandler={true}
    >
      <Label>{I18n.t("bonus.cgn.otp.screen.bottomSheet.cta")}</Label>
    </ButtonDefaultOpacity>
  </>
);

/**
 * A bottomsheet that display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * This will be also visualized inside a bottomsheet after an addition of a new bancomat
 */
export default (onPress: () => void) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheet(
    <OtpNotWorking
      onPress={() => {
        dismiss();
        onPress();
      }}
    />,
    I18n.t("bonus.cgn.otp.screen.link"),
    380
  );
  return {
    present,
    bottomSheet,
    dismiss
  };
};
