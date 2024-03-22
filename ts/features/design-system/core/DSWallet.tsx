import * as React from "react";
import { WalletCardCategoryContainer } from "../../newWallet/components/WalletCardCategoryContainer";
import { WalletCard, WalletCardCategory } from "../../newWallet/types";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DesignSystemSection } from "../components/DesignSystemSection";

export const DSWallet = () => {
  const cards: ReadonlyArray<WalletCard> = [
    {
      key: "1",
      type: "payment",
      category: "payment",
      walletId: "1",
      hpan: "1234",
      brand: "visa",
      holderName: "Anna Verdi",
      expireDate: new Date()
    },
    {
      key: "2",
      type: "idPay",
      category: "bonus",
      initiativeId: "1",
      amount: 12345,
      avatarSource: {
        uri: ""
      },
      expireDate: new Date(),
      name: "bla bla"
    },
    {
      key: "3",
      type: "idPay",
      category: "bonus",
      initiativeId: "1",
      amount: 12345,
      avatarSource: {
        uri: ""
      },
      expireDate: new Date(),
      name: "bla bla"
    },
    {
      key: "4",
      type: "idPay",
      category: "bonus",
      initiativeId: "1",
      amount: 12345,
      avatarSource: {
        uri: ""
      },
      expireDate: new Date(),
      name: "bla bla"
    }
  ];

  const cardsByCategory = cards.reduce(
    (acc, card) => ({
      ...acc,
      [card.category]: [...(acc[card.category] || []), card]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<WalletCard> }
  );

  return (
    <DesignSystemScreen title={"Wallet"}>
      <DesignSystemSection title="Single card">
        <WalletCardCategoryContainer
          label="Metodi di pagamento"
          iconName="creditCard"
          cards={cardsByCategory.payment}
        />
      </DesignSystemSection>

      <DesignSystemSection title="Multiple card">
        <WalletCardCategoryContainer
          label="Iniziative welfare"
          iconName="bonus"
          cards={cardsByCategory.bonus}
        />
      </DesignSystemSection>

      <DesignSystemSection title="Multiple card (expanded)">
        <WalletCardCategoryContainer
          label="Iniziative welfare"
          iconName="bonus"
          cards={cardsByCategory.bonus}
        />
      </DesignSystemSection>
    </DesignSystemScreen>
  );
};
