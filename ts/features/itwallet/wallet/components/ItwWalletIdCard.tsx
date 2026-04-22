import I18n from "i18next";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useGuidedTourRegion } from "../../../tour/components/useGuidedTourRegion";
import { TourItemMeasurement } from "../../../tour/types";
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

export const ItwWalletIdCard = () => {
  const navigation = useIONavigation();
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidIssuedAt = useIOSelector(itwCredentialsEidIssuedAtSelector);

  const cardRef = useRef<View>(null);
  const [cardMeasurement, setCardMeasurement] = useState<
    TourItemMeasurement | undefined
  >(undefined);

  const cardRegion = useCallback(() => cardMeasurement, [cardMeasurement]);

  useGuidedTourRegion({
    groupId: ITW_TOUR_GROUP_ID,
    index: ITW_TOUR_STEP_ID,
    title: I18n.t("features.itWallet.tour.id.title"),
    description: I18n.t("features.itWallet.tour.id.description"),
    region: cardRegion
  });

  const handlePress = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  return (
    <View
      ref={cardRef}
      style={{ flex: 1 }}
      onLayout={() => {
        cardRef.current?.measureInWindow((x, y, width, height) => {
          if (width !== 0 || height !== 0) {
            setCardMeasurement({ x, y, width, height });
          }
        });
      }}
    >
      <WalletCardPressableBase onPress={handlePress}>
        <ItwCredentialCard
          credentialType={CredentialType.PID}
          credentialStatus={eidStatus}
          issuedAt={eidIssuedAt}
        />
      </WalletCardPressableBase>
    </View>
  );
};
