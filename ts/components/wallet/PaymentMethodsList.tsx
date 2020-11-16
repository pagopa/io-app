/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import { ListItem, View } from "native-base";
import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { H3 } from "../core/typography/H3";
import { H5 } from "../core/typography/H5";
import { IOColors } from "../core/variables/IOColors";
import { withLightModalContext } from "../helpers/withLightModalContext";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import ListItemComponent from "../screens/ListItemComponent";
import IconFont from "../ui/IconFont";
import { LightModalContextInterface } from "../ui/LightModal";

type OwnProps = Readonly<{
  paymentMethods: ReadonlyArray<IPaymentMethod>;
  navigateToAddCreditCard: () => void;
}>;

type Props = OwnProps & LightModalContextInterface;

export type IPaymentMethod = Readonly<{
  name: string;
  description: string;
  maxFee?: string;
  icon?: any;
  image?: any;
  implemented: boolean;
  isNew?: boolean;
  onPress?: () => void;
}>;

const styles = StyleSheet.create({
  container: {
    paddingRight: 10,
    paddingLeft: 0,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  descriptionPadding: { paddingRight: 24 }
});

const PaymentMethodsList: React.FunctionComponent<Props> = (props: Props) => (
  <>
    <View spacer={true} large={true} />
    <FlatList
      removeClippedSubviews={false}
      data={props.paymentMethods}
      keyExtractor={item => item.name}
      ListFooterComponent={<View spacer />}
      renderItem={itemInfo =>
        itemInfo.item.implemented && (
          <ListItem
            onPress={itemInfo.item.onPress}
            style={styles.container}
            first={itemInfo.index === 0}
            last={itemInfo.index === props.paymentMethods.length - 1}
          >
            <View style={styles.flexColumn}>
              <View style={styles.row}>
                <H3 color={"bluegreyDark"} weight={"SemiBold"}>
                  {itemInfo.item.name}
                </H3>
                <IconFont name={"io-right"} color={IOColors.blue} size={24} />
              </View>
              <H5
                color={"bluegrey"}
                weight={"Regular"}
                style={styles.descriptionPadding}
              >
                {itemInfo.item.description}
              </H5>
            </View>
          </ListItem>
        )
      }
    />
  </>
);

export default withLightModalContext(PaymentMethodsList);
