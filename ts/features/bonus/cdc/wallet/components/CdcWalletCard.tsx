import { constVoid } from "fp-ts/lib/function";
import { withWalletCardBaseComponent } from "../../../../wallet/components/WalletCardBaseComponent";
import { WalletCardPressableBase } from "../../../../wallet/components/WalletCardPressableBase";
import { CdcCard, CdcCardProps } from "./CdcCard";

export type CdcWalletCardProps = CdcCardProps;

const WrappedCdcCard = (props: CdcCardProps) => {
  const { ...cardProps } = props;

  const handleOnPress = () => constVoid;

  return (
    <WalletCardPressableBase onPress={handleOnPress}>
      <CdcCard {...cardProps} />
    </WalletCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the PaymentCard component
 */
export const CdcWalletCard = withWalletCardBaseComponent(WrappedCdcCard);
