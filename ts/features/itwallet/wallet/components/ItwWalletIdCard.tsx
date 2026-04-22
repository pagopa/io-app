import I18n from "i18next";
import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { GuidedTour } from "../../../tour/components/GuidedTour";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  itwCredentialsEidIssuedAtSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  ITW_TOUR_GROUP_ID,
  ITW_TOUR_STEP_ID
} from "../../tour/utils/constants.ts";

export const ItwWalletIdCard = ({ isStacked }: any) => {
  const navigation = useIONavigation();
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidIssuedAt = useIOSelector(itwCredentialsEidIssuedAtSelector);

  const handlePress = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  return (
    <GuidedTour
      groupId={ITW_TOUR_GROUP_ID}
      index={ITW_TOUR_STEP_ID}
      title={I18n.t("features.itWallet.tour.id.title")}
      description={I18n.t("features.itWallet.tour.id.description")}
    >
      <View style={[styles.idWrapper, isStacked && styles.idWrapperStacked]}>
        <WalletCardPressableBase onPress={handlePress}>
          <ItwCredentialCard
            credentialType={CredentialType.PID}
            credentialStatus={eidStatus}
            issuedAt={eidIssuedAt}
          />
        </WalletCardPressableBase>
      </View>
    </GuidedTour>
  );
};

const styles = StyleSheet.create({
  idWrapper: {
    aspectRatio: 16 / 10
  },
  idWrapperStacked: {
    aspectRatio: 16 / 3
  }
});
