import * as React from "react";

import { ComponentProps } from "../../../types/react";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import { RotatedCards } from "./RotatedCards";

type Props = Readonly<{
  wallets: ComponentProps<typeof RotatedCards>["wallets"];
  navigateToWalletList: () => void;
}>;

const CardsFan: React.SFC<Props> = props => {
  return (
    <TouchableDefaultOpacity onPress={props.navigateToWalletList}>
      <RotatedCards cardType="Preview" wallets={props.wallets} />
    </TouchableDefaultOpacity>
  );
};

export default CardsFan;
