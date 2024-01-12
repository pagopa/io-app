import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useCallback } from "react";
import { View } from "react-native";
import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { BonusVisibilityEnum } from "../../../../../definitions/content/BonusVisibility";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import SectionStatusComponent from "../../../../components/SectionStatus";
import StatusContent from "../../../../components/SectionStatus/StatusContent";
import { Label } from "../../../../components/core/typography/Label";
import ActivityIndicator from "../../../../components/ui/ActivityIndicator";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ID_CDC_TYPE } from "../../bonusVacanze/utils/bonus";
import { fold } from "../../bpd/model/RemoteValue";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import {
  allAvailableBonusTypesSelector,
  availableBonusTypesSelectorFromId
} from "../../common/store/selectors";
import { CDC_ROUTES } from "../navigation/routes";
import { cdcRequestBonusList } from "../store/actions/cdcBonusRequest";
import { cdcBonusRequestListSelector } from "../store/reducers/cdcBonusRequest";
import { CdcBonusRequestList } from "../types/CdcBonusRequest";

type ReadyButtonProp = {
  bonusRequestList: CdcBonusRequestList;
};
const ReadyButton = (props: ReadyButtonProp) => {
  const navigation = useNavigation();

  // Check if at least one year can be activable
  const activableBonuses = props.bonusRequestList.filter(
    b => b.status === StatoBeneficiarioEnum.ATTIVABILE
  );

  if (activableBonuses.length > 0) {
    return (
      <ButtonDefaultOpacity
        block
        primary
        onPress={() => {
          navigation.navigate(CDC_ROUTES.BONUS_REQUEST_MAIN, {
            screen: CDC_ROUTES.INFORMATION_TOS
          });
        }}
        testID={"activateCardButton"}
      >
        <Label color={"white"}>
          {I18n.t("bonus.cdc.serviceCta.activable")}
        </Label>
      </ButtonDefaultOpacity>
    );
  }

  // Check if at least one year is in pending status
  const pendingBonuses = props.bonusRequestList.filter(
    b => b.status === StatoBeneficiarioEnum.VALUTAZIONE
  );
  if (pendingBonuses.length > 0) {
    return (
      <ButtonDefaultOpacity
        block
        disabled={true}
        onPress={() => true}
        testID={"pendingCardButton"}
      >
        <Label color={"white"}>{I18n.t("bonus.cdc.serviceCta.pending")}</Label>
      </ButtonDefaultOpacity>
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
      <StatusContent
        accessibilityLabel={`${I18n.t(
          "bonus.cdc.serviceCta.error.status"
        )} ${I18n.t("global.accessibility.alert")}`}
        backgroundColor={"orange"}
        foregroundColor={"white"}
        iconName={"notice"}
        ref={viewRef}
      >
        {I18n.t("bonus.cdc.serviceCta.error.status")}
      </StatusContent>
      <VSpacer size={16} />
      <ButtonDefaultOpacity
        block
        primary
        bordered
        onPress={props.onPress}
        testID={"retryButton"}
      >
        <Label color={"blue"}>{I18n.t("global.buttons.retry")}</Label>
      </ButtonDefaultOpacity>
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
