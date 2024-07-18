import { ListItemSwitch } from "@pagopa/io-app-design-system";
import * as React from "react";
import { CredentialType } from "../../itwallet/common/utils/itwMocksUtils";
import { WalletCardsCategoryContainer } from "../../newWallet/components/WalletCardsCategoryContainer";
import { WalletCard, WalletCardCategory } from "../../newWallet/types";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DesignSystemSection } from "../components/DesignSystemSection";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/ItwDiscoveryBanner";

export const DSWallet = () => {
  const [isStacked, setStacked] = React.useState(true);

  const cards: ReadonlyArray<WalletCard> = [
    {
      key: "1",
      type: "idPay",
      category: "bonus",
      initiativeId: "1",
      amount: 412.69,
      avatarSource: {
        uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
      },
      expireDate: new Date(),
      name: "18 App"
    },
    {
      key: "2",
      type: "idPay",
      category: "bonus",
      initiativeId: "1",
      amount: 412.69,
      avatarSource: {
        uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
      },
      expireDate: new Date(),
      name: "18 App"
    },
    {
      key: "3",
      type: "payment",
      category: "payment",
      walletId: "1",
      hpan: "9900",
      brand: "maestro",
      holderName: "Anna Verdi",
      expireDate: new Date()
    },
    {
      key: "4",
      type: "payment",
      category: "payment",
      walletId: "1",
      holderEmail: "anna_v********@**hoo.it"
    },
    {
      key: "5",
      type: "payment",
      category: "payment",
      walletId: "1",
      hpan: "9900",
      brand: "maestro",
      holderName: "Anna Verdi",
      expireDate: new Date(),
      isExpired: true
    },
    {
      key: "6",
      type: "itw",
      category: "itw",
      credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
    },
    {
      key: "7",
      type: "itw",
      category: "itw",
      credentialType: CredentialType.DRIVING_LICENSE
    },
    {
      key: "8",
      type: "itw",
      category: "itw",
      credentialType: CredentialType.PID
    },
    {
      key: "9",
      type: "cgn",
      category: "cgn",
      expireDate: new Date(2025, 1, 1)
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
      <ListItemSwitch
        label="Show stacked cards"
        value={isStacked}
        onSwitchValueChange={setStacked}
      />
      <DesignSystemSection title="With IT Wallet">
        <WalletCardsCategoryContainer
          cards={cardsByCategory.itw}
          header={{
            label: "IT Wallet",
            iconName: "fiscalCodeIndividual"
          }}
          isStacked={isStacked}
        />
        <WalletCardsCategoryContainer
          cards={cardsByCategory.payment}
          header={{
            label: "Metodi di pagamento",
            iconName: "creditCard"
          }}
          isStacked={isStacked}
        />
        <WalletCardsCategoryContainer
          cards={[...cardsByCategory.cgn, ...cardsByCategory.bonus]}
          header={{
            label: "Altro"
          }}
          isStacked={isStacked}
        />
      </DesignSystemSection>

      <DesignSystemSection title="Without IT Wallet">
        <WalletCardsCategoryContainer
          cards={[
            ...cardsByCategory.payment,
            ...cardsByCategory.cgn,
            ...cardsByCategory.bonus
          ]}
          isStacked={isStacked}
        />
      </DesignSystemSection>
    </DesignSystemScreen>
  );
};
