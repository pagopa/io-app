import { Pressable } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayCard, IdPayCardProps } from "./IdPayCard";

export type IdPayWalletCardProps = IdPayCardProps & {
  initiativeId: string;
};

const WrappedIdPayCard = (props: IdPayWalletCardProps) => {
  const navigation = useIONavigation();

  const { initiativeId, ...cardProps } = props;

  const handleOnPress = () => {
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId
      }
    });
  };

  return (
    <Pressable accessibilityRole="button" onPress={handleOnPress}>
      <IdPayCard {...cardProps} />
    </Pressable>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the IdPayCard component
 */
export const IdPayWalletCard = withWalletCardBaseComponent(WrappedIdPayCard);
