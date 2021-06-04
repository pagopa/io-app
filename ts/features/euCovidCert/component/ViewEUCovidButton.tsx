import React from "react";
import IconFont from "../../../components/ui/IconFont";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import { IOColors } from "../../../components/core/variables/IOColors";

type Props = {
  onPress?: () => void;
};

export const ViewEUCovidButton = (props: Props) => (
  <ButtonDefaultOpacity
    onPress={props.onPress}
    xsmall={true}
    bordered={false}
    style={{ flex: 1 }}
  >
    <IconFont name={"io-qr"} color={IOColors.white} />
    <Label
      color={"white"}
      style={{ marginLeft: 2, marginBottom: 4, height: 21 }}
    >
      {"Visualizza"}
    </Label>
  </ButtonDefaultOpacity>
);
