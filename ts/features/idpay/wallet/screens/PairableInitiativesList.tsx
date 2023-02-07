import React from "react";
import { ScrollView } from "react-native";
import { InitiativeDTO } from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";

type ListItemProps = {
  item: InitiativeDTO;
};

const InitiativeListItem = ({ item }: ListItemProps) => {
  const [isActive, setIsActive] = React.useState(false);
  const changeActiveState = () => setIsActive(_ => !_);
  return (
    <ListItemComponent
      accessibilityRole="switch"
      isLongPressEnabled={true}
      onSwitchValueChanged={changeActiveState}
      switchValue={isActive}
      title={item.initiativeName ?? ""}
      // the list is already filtered when passed to the screen,
      // so realistically the name is never undefined
    />
  );
};

export type PairableInitiativesListScreenNavigationParams = {
  initiatives: Array<InitiativeDTO>;
  idWallet: number;
};

type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_IDPAY_INITIATIVE_LIST"
>;

export const IdPayInitiativeListScreen = (props: Props) => {
  const { initiatives, idWallet } = props.route.params;
  return (
    <BaseScreenComponent
      headerTitle={`Attiva iniziative IDPay sul portafoglio ${idWallet}`}
      goBack={true}
    >
      <ScrollView style={IOStyles.horizontalContentPadding}>
        {initiatives.map(item => (
          <React.Fragment key={item.initiativeId}>
            <InitiativeListItem item={item} />
            <VSpacer size={16} />
          </React.Fragment>
        ))}
        <VSpacer size={24} />
      </ScrollView>
    </BaseScreenComponent>
  );
};
