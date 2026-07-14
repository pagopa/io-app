import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { FC, useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";

import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isCGNEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import {
  availableBonusTypesSelectorFromId,
  isAvailableBonusErrorSelector,
  supportedAvailableBonusSelector
} from "../../../common/store/selectors";
import { ID_CGN_TYPE } from "../../../common/utils";
import { cgnActivationStart } from "../../store/actions/activation";

/**
 * this is a dummy screen reachable only from a message CTA
 */
const CgnCTAStartOnboardingComponent: FC = () => {
  const dispatch = useIODispatch();
  const isFirstRender = useRef<boolean>(true);

  const availableBonus = useIOSelector(supportedAvailableBonusSelector);
  const cgnBonus = useIOSelector(
    availableBonusTypesSelectorFromId(ID_CGN_TYPE)
  );
  const hasError = useIOSelector(isAvailableBonusErrorSelector);

  const loadAvailableBonus = useCallback(() => {
    dispatch(loadAvailableBonuses.request());
  }, [dispatch]);

  const startCgn = useCallback(() => {
    dispatch(cgnActivationStart());
  }, [dispatch]);

  // load available bonus when component is focused
  useActionOnFocus(loadAvailableBonus);

  useEffect(() => {
    // cgnActivationStart navigate to ToS screen that needs cgb bonus from available bonus list
    if (availableBonus.length > 0 && cgnBonus && isFirstRender.current) {
      startCgn();
      // eslint-disable-next-line functional/immutable-data
      isFirstRender.current = false;
    }
  }, [availableBonus, startCgn, cgnBonus]);

  useHeaderSecondLevel({
    title: I18n.t("bonus.cgn.name"),
    canGoBack: true,
    transparent: true
  });

  if (hasError) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t("global.buttons.retry"),
          onPress: loadAvailableBonus
        }}
        pictogram="umbrella"
        title={I18n.t("global.genericError")}
      />
    );
  }

  return <LoadingScreenContent title={I18n.t("global.remoteStates.loading")} />;
};

/**
 * this is a dummy screen reachable only from a message CTA
 */
const CgnCTAStartOnboardingScreen = () => {
  const navigation = useNavigation();
  const isCgnEnabled = useIOSelector(isCGNEnabledSelector);

  if (isCgnEnabled) {
    return <CgnCTAStartOnboardingComponent />;
  } else {
    Alert.alert(
      I18n.t("bonus.cgn.name"),
      I18n.t("bonus.state.completed.description")
    );
    navigation.goBack();
    return null;
  }
};

export default CgnCTAStartOnboardingScreen;
