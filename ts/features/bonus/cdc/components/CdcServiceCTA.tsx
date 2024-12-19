import {
  Alert,
  ButtonOutline,
  ButtonSolid,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useCallback } from "react";
import { View } from "react-native";
import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { BonusVisibilityEnum } from "../../../../../definitions/content/BonusVisibility";
import { fold } from "../../../../common/model/RemoteValue";
import SectionStatusComponent from "../../../../components/SectionStatus";
import ActivityIndicator from "../../../../components/ui/ActivityIndicator";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import {
  allAvailableBonusTypesSelector,
  availableBonusTypesSelectorFromId
} from "../../common/store/selectors";
import { ID_CDC_TYPE } from "../../common/utils";
import { CDC_ROUTES } from "../navigation/routes";
import { cdcRequestBonusList } from "../store/actions/cdcBonusRequest";
import { cdcBonusRequestListSelector } from "../store/reducers/cdcBonusRequest";
import { CdcBonusRequestList } from "../types/CdcBonusRequest";

type ReadyButtonProp = {
  bonusRequestList: CdcBonusRequestList;
};
const ReadyButton = (props: ReadyButtonProp) => {
  const navigation = useIONavigation();

  // Check if at least one year can be activable
  const activableBonuses = props.bonusRequestList.filter(
    b => b.status === StatoBeneficiarioEnum.ATTIVABILE
  );

  if (activableBonuses.length > 0) {
    return (
      <ButtonSolid
        fullWidth
        label={I18n.t("bonus.cdc.serviceCta.activable")}
        accessibilityLabel={I18n.t("bonus.cdc.serviceCta.activable")}
        onPress={() => {
          navigation.navigate(CDC_ROUTES.BONUS_REQUEST_MAIN, {
            screen: CDC_ROUTES.INFORMATION_TOS
          });
        }}
        testID={"activateCardButton"}
      />
    );
  }

  // Check if at least one year is in pending status
  const pendingBonuses = props.bonusRequestList.filter(
    b => b.status === StatoBeneficiarioEnum.VALUTAZIONE
  );
  if (pendingBonuses.length > 0) {
    return (
      <ButtonSolid
        fullWidth
        disabled
        onPress={() => true}
        label={I18n.t("bonus.cdc.serviceCta.pending")}
        accessibilityLabel={I18n.t("bonus.cdc.serviceCta.pending")}
        testID={"pendingCardButton"}
      />
    );
  }

  // If the bonuses can't be requested return null
  return null;
};

type ErrorButtonProp = {
  onPress: () => void;
};
const ErrorButton = (props: ErrorButtonProp) => {
  const viewRef = React.createRef<View>();

  return (
    <View>
      <Alert
        ref={viewRef}
        variant="warning"
        content={I18n.t("bonus.cdc.serviceCta.error.status")}
        accessibilityHint={I18n.t("global.accessibility.alert")}
        testID={"errorAlert"}
      />
      <VSpacer size={16} />
      <ButtonOutline
        fullWidth
        label={I18n.t("global.buttons.retry")}
        accessibilityLabel={I18n.t("global.buttons.retry")}
        onPress={props.onPress}
        testID={"retryButton"}
      />
    </View>
  );
};

const CdcServiceCTAButton = () => {
  const dispatch = useIODispatch();
  const cdcBonusRequestList = useIOSelector(cdcBonusRequestListSelector);
  const allAvailableBonusTypes = useIOSelector(allAvailableBonusTypesSelector);
  const cdcInfo = useIOSelector(availableBonusTypesSelectorFromId(ID_CDC_TYPE));

  useFocusEffect(
    useCallback(() => {
      if (cdcInfo === undefined) {
        dispatch(loadAvailableBonuses.request());
      }
    }, [cdcInfo, dispatch])
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(cdcRequestBonusList.request());
    }, [dispatch])
  );

  return pot.fold(
    allAvailableBonusTypes,
    () => null,
    () => <ActivityIndicator />,
    () => <ActivityIndicator />,
    () => (
      <ErrorButton onPress={() => dispatch(loadAvailableBonuses.request())} />
    ),
    _ => {
      if (
        cdcInfo === undefined ||
        cdcInfo.visibility === BonusVisibilityEnum.hidden
      ) {
        return null;
      }
      return fold(
        cdcBonusRequestList,
        () => null,
        () => <ActivityIndicator />,
        bonusRequestList => <ReadyButton bonusRequestList={bonusRequestList} />,
        _ => (
          <ErrorButton
            onPress={() => dispatch(cdcRequestBonusList.request())}
          />
        )
      );
    },
    () => <ActivityIndicator />,
    () => <ActivityIndicator />,
    _ => (
      <ErrorButton onPress={() => dispatch(loadAvailableBonuses.request())} />
    )
  );
};

const CdcServiceCTA = () => (
  <View>
    <SectionStatusComponent sectionKey={"cdc"} />
    <VSpacer size={16} />
    <CdcServiceCTAButton />
  </View>
);

export default CdcServiceCTA;
