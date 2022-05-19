import * as React from "react";
import { useCallback } from "react";
import { View as RNView } from "react-native";
import { View } from "native-base";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Label } from "../../../../components/core/typography/Label";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import ActivityIndicator from "../../../../components/ui/ActivityIndicator";
import { cdcRequestBonusList } from "../store/actions/cdcBonusRequest";
import { cdcBonusRequestListSelector } from "../store/reducers/cdcBonusRequest";
import { fold } from "../../bpd/model/RemoteValue";
import { CdcBonusRequestList } from "../types/CdcBonusRequest";
import { IOColors } from "../../../../components/core/variables/IOColors";
import StatusContent from "../../../../components/SectionStatus/StatusContent";
import { StatoBeneficiarioEnum } from "../../../../../definitions/cdc/StatoBeneficiario";
import { CDC_ROUTES } from "../navigation/routes";
import SectionStatusComponent from "../../../../components/SectionStatus";

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

const ErrorButton = () => {
  const viewRef = React.createRef<RNView>();
  const dispatch = useIODispatch();

  return (
    <View>
      <StatusContent
        accessibilityLabel={`${I18n.t(
          "bonus.cdc.serviceCta.error.status"
        )} ${I18n.t("global.accessibility.alert")}`}
        backgroundColor={"orange"}
        iconColor={IOColors.white}
        iconName={"io-warning"}
        viewRef={viewRef}
        labelColor={"white"}
      >
        {I18n.t("bonus.cdc.serviceCta.error.status")}
      </StatusContent>
      <View spacer={true} />
      <ButtonDefaultOpacity
        block
        primary
        bordered
        onPress={() => dispatch(cdcRequestBonusList.request())}
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

  useFocusEffect(
    useCallback(() => {
      dispatch(cdcRequestBonusList.request());
    }, [dispatch])
  );

  return fold(
    cdcBonusRequestList,
    () => null,
    () => <ActivityIndicator />,
    bonusRequestList => <ReadyButton bonusRequestList={bonusRequestList} />,
    _ => <ErrorButton />
  );
};

const CdcServiceCTA = () => (
  <View>
    <SectionStatusComponent sectionKey={"cdc"} />
    <View spacer />
    <CdcServiceCTAButton />
  </View>
);

export default CdcServiceCTA;
