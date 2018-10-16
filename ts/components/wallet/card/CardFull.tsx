import { View } from "native-base";
import * as React from "react";

import { Wallet } from "../../../types/pagopa";
import { WalletStyles } from "../../styles/wallet";
import CardComponent from "./CardComponent";

type Props = Readonly<{
  wallet: Wallet;
  favoriteWalletId?: number;
  onSetFavoriteWallet?: (walletId?: number) => void;
  onDeleteWallet?: (walletId: number) => void;
  navigateToWalletTransactions?: (wallet: Wallet) => void;
}>;

const CardFull: React.SFC<Props> = props => {
  const { favoriteWalletId, onSetFavoriteWallet, onDeleteWallet } = props;

  const onSetFavoriteForWallet = (idWallet: number) =>
    onSetFavoriteWallet !== undefined
      ? (willBeFavorite: boolean) =>
          onSetFavoriteWallet(willBeFavorite ? idWallet : undefined)
      : undefined;

  const onDeleteForWallet = (idWallet: number) =>
    onDeleteWallet !== undefined ? () => onDeleteWallet(idWallet) : undefined;

  return (
    <View style={WalletStyles.container}>
      <CardComponent
        wallet={props.wallet}
        showFavoriteIcon={false}
        menu={true}
        lastUsage={false}
        flatBottom={true}
        isFavorite={
          favoriteWalletId !== undefined &&
          favoriteWalletId === props.wallet.idWallet
        }
        onSetFavorite={onSetFavoriteForWallet(props.wallet.idWallet)}
        onDelete={onDeleteForWallet(props.wallet.idWallet)}
        navigateToWalletTransactions={props.navigateToWalletTransactions}
      />
    </View>
  );
};

export default CardFull;
