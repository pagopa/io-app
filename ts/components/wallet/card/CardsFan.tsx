import * as React from "react";

import { ComponentProps } from "../../../types/react";
import { RotatedCards } from "./RotatedCards";

type Props = Readonly<{
  wallets: ComponentProps<typeof RotatedCards>["wallets"];
  navigateToWalletList: () => void;
}>;

const CardsFan: React.SFC<Props> = props => (
    <RotatedCards
      cardType="Preview"
      wallets={props.wallets}
      onClick={props.navigateToWalletList}
    />
  );

export default CardsFan;
