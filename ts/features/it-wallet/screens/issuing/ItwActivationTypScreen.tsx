import React from "react";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ROUTES from "../../../../navigation/routes";
import ItwActionCompleted from "../../components/ItwActionCompleted";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

const ItwActivationTypScreen = (): React.ReactElement => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Simulate a loading time for
  // a backgroud process
  // in order to show the loading spinner
  // In production this will be removed
  useOnFirstRender(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  });

  return (
    <ItwLoadingSpinnerOverlay
      isLoading={isLoading}
      captionTitle={I18n.t("features.itWallet.issuing.loading.title")}
      captionSubtitle={I18n.t("features.itWallet.issuing.loading.subtitle")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <BaseScreenComponent goBack={false}>
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
    </ItwLoadingSpinnerOverlay>
  );
};

export default ItwActivationTypScreen;
