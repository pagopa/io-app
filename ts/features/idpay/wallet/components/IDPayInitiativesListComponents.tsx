import * as pot from "@pagopa/ts-commons/lib/pot";
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
import { idPayInitiativeAwaitingUpdateSelector } from "../store/reducers";

type ValidStatus = typeof StatusEnum.ACTIVE | typeof StatusEnum.INACTIVE;
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
  const dispatch = useIODispatch();
  const isAwaitingUpdate = useIOSelector(state =>
    idPayInitiativeAwaitingUpdateSelector(state, item.initiativeId)
  );
  const updateInitiativeStatus = (status: ValidStatus) => {
    const isItemActiveAndValid =
      status === StatusEnum.ACTIVE && item.idInstrument !== undefined;
    if (isItemActiveAndValid) {
      dispatch(
        idpayInitiativesInstrumentDelete.request({
          // checked in isItemActiveAndValid
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          instrumentId: item.idInstrument!,
          initiativeId: item.initiativeId
        })
      );
    } else {
      dispatch(
        idpayInitiativesInstrumentEnroll.request({
          idWallet,
          initiativeId: item.initiativeId
        })
      );
    }
  };

  return (
    <NBlistItem style={{ justifyContent: "space-between", paddingRight: 0 }}>
      <H4>{item.initiativeName}</H4>
      <SwitchOrStatusLabel
        status={item.status}
        onValueChangeFunction={updateInitiativeStatus}
        isAwaitingUpdate={isAwaitingUpdate}
      />
    </NBlistItem>
  );
};

type SwitchOrStatusLabelProps = {
  status: StatusEnum;
  onValueChangeFunction: (status: ValidStatus) => void;
  isAwaitingUpdate: boolean | undefined;
};
const SwitchOrStatusLabel = ({
  status,
  onValueChangeFunction,
  isAwaitingUpdate
}: SwitchOrStatusLabelProps) => {
  switch (status) {
    case StatusEnum.ACTIVE:
    case StatusEnum.INACTIVE:
      const switchValue = getRemoteSwitchValue(
        status === StatusEnum.ACTIVE,
        isAwaitingUpdate
      );
      return (
        // we are passing status here because we are sure it is either ACTIVE or INACTIVE
        <RemoteSwitch
          onValueChange={() => onValueChangeFunction(status)}
          value={switchValue}
        />
      );
    case StatusEnum.PENDING_ENROLLMENT_REQUEST:
    case StatusEnum.PENDING_DEACTIVATION_REQUEST:
    case StatusEnum.ENROLLMENT_FAILED:
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

const getRemoteSwitchValue = (
  isItemActive: boolean,
  isAwaitingUpdate: boolean | undefined
) => {
  const isItemActivePot = pot.some(isItemActive);
  switch (isAwaitingUpdate) {
    case undefined:
      return isItemActivePot;
    case true:
      return pot.toLoading(isItemActivePot);
    case false:
      return pot.toUpdating(isItemActivePot, !isItemActive);
    default:
      return pot.none;
  }
};
