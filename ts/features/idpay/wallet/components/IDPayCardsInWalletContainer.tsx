import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { idPayWalletSubscribedInitiativeListSelector } from "../store/reducers";
import { IDPayDetailsRoutes } from "../../initiative/details/navigation";
import IDPayCardPreviewComponent from "./IDPayCardPreviewComponent";

type Props = {
  initiativeList: ReadonlyArray<InitiativeDTO>;
};

const IDPayCardsList = (props: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleCardPress = (initiativeId: string) => {
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: { initiativeId }
    });
  };

  return (
    <View>
      {props.initiativeList.map(initiative => (
        <IDPayCardPreviewComponent
          key={initiative.initiativeId}
          initiativeName={initiative.initiativeName}
          availableAmount={initiative.amount}
          logoUrl="https://it.idcert.io/assets/images/logos/18app.png" // TODO remove temporary logo
          onPress={() => handleCardPress(initiative.initiativeId)}
        />
      ))}
    </View>
  );
};

// Avoid re-rendering if the list of initiatives is the same
const IDPayCardsListMemo = React.memo(IDPayCardsList);

const IDPayCardsInWalletContainer = () => {
  const initiativeList = useIOSelector(
    idPayWalletSubscribedInitiativeListSelector
  );
  return (
    <IDPayCardsListMemo initiativeList={pot.getOrElse(initiativeList, [])} />
  );
};

export default IDPayCardsInWalletContainer;
