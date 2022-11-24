import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import _ from "lodash";
import React from "react";
import { View } from "react-native";
import { InitiativeDTO } from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  IDPayConfigurationParamsList,
  IDPayConfigurationRoutes
} from "../../initiative/configuration/navigation/navigator";
import { idPayWalletInitiativeListSelector } from "../store/reducers";
import IDPayCardPreviewComponent from "./IDPayCardPreviewComponent";

type Props = {
  initiativeList: ReadonlyArray<InitiativeDTO>;
};

const IDPayCardsList = (props: Props) => {
  const navigation =
    useNavigation<IOStackNavigationProp<IDPayConfigurationParamsList>>();

  const handleCardPress = (_: string) => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_ASSOCIATION_SUCCES
    });
  };

  return (
    <View>
      {props.initiativeList.map(initiative => (
        <IDPayCardPreviewComponent
          key={initiative.initiativeId}
          initiativeId={initiative.initiativeId}
          initiativeName={initiative.initiativeName}
          endDate={initiative.endDate}
          availableAmount={initiative.amount}
          onPress={() => handleCardPress(initiative.initiativeId)}
        />
      ))}
    </View>
  );
};

// Avoid re-rendering if the list of initiatives is the same
const IDPayCardsListMemo = React.memo(IDPayCardsList);

const IDPayCardsInWalletContainer = () => {
  const initiativeList = useIOSelector(idPayWalletInitiativeListSelector);
  return (
    <IDPayCardsListMemo initiativeList={pot.getOrElse(initiativeList, [])} />
  );
};

export default IDPayCardsInWalletContainer;
