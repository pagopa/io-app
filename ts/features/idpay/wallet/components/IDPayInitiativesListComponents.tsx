import { Badge as NBbadge, ListItem as NBlistItem } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import {
  InitiativesStatusDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativesStatusDTO";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TypedI18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../store/actions";
import { idPayInitiativeFromInstrumentPotSelector } from "../store/reducers";

const styles = StyleSheet.create({
  badge: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.blue
  }
});

type InitiativeListProps = {
  initiatives: ReadonlyArray<InitiativesStatusDTO>;
  idWallet: string;
};
/*
 * This component is used to map a list of initiatives
 * to a list of InitiativeListItem
 */
export const IDPayInitiativesList = ({
  initiatives,
  idWallet
}: InitiativeListProps) => (
  <>
    {initiatives.map(item => (
      <IDPayInitiativeListItem
        item={item}
        key={item.initiativeId}
        idWallet={idWallet}
      />
    ))}
  </>
);

type ListItemProps = {
  item: InitiativesStatusDTO;
  idWallet: string;
};

export const IDPayInitiativeListItem = ({ item, idWallet }: ListItemProps) => {
  const { initiativeName } = item;

  return (
    <NBlistItem style={{ justifyContent: "space-between", paddingRight: 0 }}>
      <H4>{initiativeName}</H4>
      <SwitchOrStatusLabel item={item} idWallet={idWallet} />
    </NBlistItem>
  );
};

type SwitchOrStatusLabelProps = {
  item: InitiativesStatusDTO;
  idWallet: string;
};
const SwitchOrStatusLabel = ({ item, idWallet }: SwitchOrStatusLabelProps) => {
  const { updateInitiativeStatus } = useInitiativeStatusUpdate(item, idWallet);
  const { status } = item;
  const switchValue = useIOSelector(state =>
    idPayInitiativeFromInstrumentPotSelector(state, item.initiativeId)
  );
  switch (status) {
    case StatusEnum.ACTIVE:
    case StatusEnum.INACTIVE:
      return (
        // we are passing status here because we are sure it is either ACTIVE or INACTIVE
        <RemoteSwitch
          onValueChange={() => updateInitiativeStatus(status)}
          value={switchValue}
        />
      );
    case StatusEnum.PENDING_ENROLLMENT_REQUEST:
    case StatusEnum.PENDING_DEACTIVATION_REQUEST:
      return (
        <NBbadge style={styles.badge}>
          <LabelSmall color="white">
            {TypedI18n.t(
              `idpay.wallet.initiativePairing.statusLabels.${status}`
            )}
          </LabelSmall>
        </NBbadge>
      );
    default:
      return null;
  }
};

const useInitiativeStatusUpdate = (
  item: InitiativesStatusDTO,
  idWallet: string
) => {
  const dispatch = useIODispatch();
  const { idInstrument, initiativeId } = item;
  type ValidStatus = typeof StatusEnum.ACTIVE | typeof StatusEnum.INACTIVE;
  const updateInitiativeStatus = (status: ValidStatus) => {
    const isItemActiveAndValid =
      status === StatusEnum.ACTIVE && idInstrument !== undefined;
    if (isItemActiveAndValid) {
      dispatch(
        idpayInitiativesInstrumentDelete.request({
          instrumentId: idInstrument,
          initiativeId
        })
      );
    } else {
      dispatch(
        idpayInitiativesInstrumentEnroll.request({
          idWallet,
          initiativeId
        })
      );
    }
  };

  return { updateInitiativeStatus };
};
