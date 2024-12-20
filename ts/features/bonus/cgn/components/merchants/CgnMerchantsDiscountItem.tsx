import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import CGN_ROUTES from "../../navigation/routes";
import { CgnDetailsParamsList } from "../../navigation/params";
import { useIODispatch } from "../../../../../store/hooks";
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

export const CgnMerchantDiscountItem: React.FunctionComponent<Props> = ({
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
