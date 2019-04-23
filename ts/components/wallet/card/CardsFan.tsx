import * as React from "react";
import { TouchableOpacity } from "react-native";

import { ComponentProps } from "../../../types/react";
import { RotatedCards } from "./RotatedCards";

type Props = Readonly<{
  wallets: ComponentProps<typeof RotatedCards>["wallets"];
  navigateToWalletList: () => void;
}>;

const CardsFan: React.SFC<Props> = props => {
  return (
    <TouchableOpacity onPress={props.navigateToWalletList}>
      <RotatedCards cardType="Preview" wallets={props.wallets} />
    </TouchableOpacity>
  );
};

export default CardsFan;
