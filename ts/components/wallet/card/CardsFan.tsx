import * as React from "react";

import { ComponentProps } from "../../../types/react";
import TouchableWithoutOpacity from "../../TouchableWithoutOpacity";
import { RotatedCards } from "./RotatedCards";

type Props = Readonly<{
  wallets: ComponentProps<typeof RotatedCards>["wallets"];
  navigateToWalletList: () => void;
}>;

const CardsFan: React.SFC<Props> = props => {
  return (
    <TouchableWithoutOpacity onPress={props.navigateToWalletList}>
      <RotatedCards cardType="Preview" wallets={props.wallets} />
    </TouchableWithoutOpacity>
  );
};

export default CardsFan;
