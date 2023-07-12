import React from "react";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ROUTES from "../../../../navigation/routes";
import ItwActionCompleted from "../../components/ItwActionCompleted";

const ItwActivationTypScreen = (): React.ReactElement => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={IOStyles.flex}>
      <BaseScreenComponent
        headerTitle="Attivazione IT Wallet"
        goBack={() => navigation.navigate(ROUTES.MAIN)}
      >
        <ItwActionCompleted
          title={I18n.t("features.itWallet.issuing.typ.title")}
          content={I18n.t("features.itWallet.issuing.typ.content")}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            onPress: () => navigation.navigate(ROUTES.ITWALLET_HOME),
            title: I18n.t("features.itWallet.issuing.typ.button"),
            block: true
          }}
        />
      </BaseScreenComponent>
    </SafeAreaView>
  );
};

export default ItwActivationTypScreen;
