import { useNavigation } from "@react-navigation/native";
import { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { selectMerchantDiscount } from "../../store/actions/merchants";
import { ModuleCgnDiscount } from "./ModuleCgnDiscount";

type Props = {
  discount: Discount;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4
  }
});

export const CgnMerchantDiscountItem: FunctionComponent<Props> = ({
  discount
}: Props) => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        CgnDetailsParamsList,
        "CGN_MERCHANTS_DISCOUNT_SCREEN"
      >
    >();
  const dispatch = useIODispatch();

  const onDiscountPress = () => {
    dispatch(selectMerchantDiscount(discount));
    navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT);
  };

  return (
    <View style={styles.container}>
      <ModuleCgnDiscount onPress={onDiscountPress} discount={discount} />
    </View>
  );
};
