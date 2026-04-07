import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { FC, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { isCGNEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import {
  availableBonusTypesSelectorFromId,
  isAvailableBonusErrorSelector,
  supportedAvailableBonusSelector
} from "../../../common/store/selectors";
import { ID_CGN_TYPE } from "../../../common/utils";
import { cgnActivationStart } from "../../store/actions/activation";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * this is a dummy screen reachable only from a message CTA
 */
const CgnCTAStartOnboardingComponent: FC<Props> = (props: Props) => {
  const isFirstRender = useRef<boolean>(true);

  // load available bonus when component is focused
  useActionOnFocus(props.loadAvailableBonus);

  const { availableBonus, startCgn, cgnBonus } = props;

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

  if (props.hasError) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t("global.buttons.retry"),
          onPress: props.loadAvailableBonus
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
const CgnCTAStartOnboardingScreen = (props: Props) => {
  const navigation = useNavigation();
  if (!props.isCgnEnabled) {
    Alert.alert(
      I18n.t("bonus.cgn.name"),
      I18n.t("bonus.state.completed.description")
    );
    navigation.goBack();
    return null;
  } else {
    return <CgnCTAStartOnboardingComponent {...props} />;
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startCgn: () => {
    dispatch(cgnActivationStart());
  },
  loadAvailableBonus: () => dispatch(loadAvailableBonuses.request())
});

const mapStateToProps = (globalState: GlobalState) => ({
  availableBonus: supportedAvailableBonusSelector(globalState),
  cgnBonus: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(globalState),
  isCgnEnabled: isCGNEnabledSelector(globalState),
  hasError: isAvailableBonusErrorSelector(globalState)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnCTAStartOnboardingScreen);
