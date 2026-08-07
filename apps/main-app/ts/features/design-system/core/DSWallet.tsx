import { ListItemHeader, VStack } from "@io-app/design-system";

import { CredentialType } from "../../itwallet/common/utils/itwMocksUtils";
import { WalletCardsCategoryContainer } from "../../wallet/components/WalletCardsCategoryContainer";
import { WalletCard, WalletCardCategory } from "../../wallet/types";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DesignSystemSection } from "../components/DesignSystemSection";

export const DSWallet = () => {
  const cardsByCategory = {
    bonus: [
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
      }
    ],
    payment: [
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
      }
    ],
    itw: [
      {
        key: "6",
        type: "itw",
        category: "itw",
        credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        credentialStatus: "valid"
      },
      {
        key: "7",
        type: "itw",
        category: "itw",
        credentialType: CredentialType.DRIVING_LICENSE,
        credentialStatus: "valid"
      },
      {
        key: "8",
        type: "itw",
        category: "itw",
        credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
        credentialStatus: "valid"
      }
    ],
    cgn: [
      {
        key: "9",
        type: "cgn",
        category: "cgn",
        expireDate: new Date(2025, 1, 1)
      }
    ]
  } satisfies Partial<Record<WalletCardCategory, ReadonlyArray<WalletCard>>>;

  const otherCards = [
    ...cardsByCategory.payment,
    ...cardsByCategory.cgn,
    ...cardsByCategory.bonus
  ];

  const blockMargin = 48;

  return (
    <DesignSystemScreen title={"Wallet"}>
      <VStack space={blockMargin}>
        <DesignSystemSection title="With Documenti su IO">
          <ListItemHeader
            iconColor="blueIO-500"
            iconName="legalValue"
            label="Documenti"
          />
          <WalletCardsCategoryContainer cards={cardsByCategory.itw} />
          <ListItemHeader label="Altro" />
          <WalletCardsCategoryContainer cards={otherCards} />
        </DesignSystemSection>
        <DesignSystemSection title="Without Documenti su IO">
          <WalletCardsCategoryContainer cards={otherCards} />
        </DesignSystemSection>
      </VStack>
    </DesignSystemScreen>
  );
};
