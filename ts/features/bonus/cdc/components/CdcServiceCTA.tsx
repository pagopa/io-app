import * as React from "react";
import { useEffect } from "react";
import { View as RNView } from "react-native";
import { View } from "native-base";
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
import { sectionStatusSelector } from "../../../../store/reducers/backendStatus";
import SectionStatusComponent from "../../../../components/SectionStatus";

type ReadyButtonProp = {
  bonusRequestList: CdcBonusRequestList;
};
const ReadyButton = (props: ReadyButtonProp) => {
  // Check if at least one year can be activable
  const activableBonuses = props.bonusRequestList.filter(
    b => b.status === "Activable"
  );

  if (activableBonuses.length > 0) {
    return (
      <ButtonDefaultOpacity
        block
        primary
        // TODO: dispatch the navigation to the first screen of the workunit
        onPress={() => true}
      >
        <Label color={"white"}>{"Attiva la carta"}</Label>
      </ButtonDefaultOpacity>
    );
  }

  // Check if at least one year is in pending status
  const pendingBonuses = props.bonusRequestList.filter(
    b => b.status === "Pending"
  );
  if (pendingBonuses.length > 0) {
    return (
      <ButtonDefaultOpacity block disabled={true} onPress={() => true}>
        <Label color={"white"}>{"Richiesta inviata"}</Label>
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
        accessibilityLabel={`Non è stato possibile recuperare le informazioni necessarie. Ti chiediamo di riprovare, ${I18n.t(
          "global.accessibility.alert"
        )}`}
        backgroundColor={"orange"}
        iconColor={IOColors.white}
        iconName={"io-warning"}
        testID={"SectionStatusComponentContent"}
        viewRef={viewRef}
        labelColor={"white"}
      >
        {`Non è stato possibile recuperare le informazioni necessarie. Ti chiediamo di riprovare.`}
      </StatusContent>
      <View spacer={true} />
      <ButtonDefaultOpacity
        block
        primary
        bordered
        onPress={() => dispatch(cdcRequestBonusList.request())}
      >
        <Label color={"blue"}>{"Riprova"}</Label>
      </ButtonDefaultOpacity>
    </View>
  );
};

const CdcServiceCTA = () => {
  const dispatch = useIODispatch();
  const cdcBonusRequestList = useIOSelector(cdcBonusRequestListSelector);
  const sectionStatus = useIOSelector(sectionStatusSelector("messages"));

  useEffect(() => {
    dispatch(cdcRequestBonusList.request());
  }, [dispatch]);

  if (sectionStatus?.is_visible) {
    return <SectionStatusComponent sectionKey={"wallets"} />;
  }

  return fold(
    cdcBonusRequestList,
    () => null,
    () => <ActivityIndicator />,
    bonusRequestList => <ReadyButton bonusRequestList={bonusRequestList} />,
    _ => <ErrorButton />
  );
};
export default CdcServiceCTA;
