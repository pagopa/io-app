import * as pot from "@pagopa/ts-commons/lib/pot";
import { Badge as NBbadge, ListItem as NBlistItem } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import {
  InitiativesStatusDTO,
  StatusEnum
} from "../../../../../definitions/idpay/wallet/InitiativesStatusDTO";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  idpayInitiativesPairingDelete,
  idpayInitiativesPairingPut
} from "../store/actions";
import { singleInitiativeQueueValueSelector } from "../store/reducers";

const styles = StyleSheet.create({
  badge: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.blue
  }
});

type ListItemProps = {
  item: InitiativesStatusDTO;
  idWallet: string;
};
export const IDPayInitiativeListItem = ({ item, idWallet }: ListItemProps) => {
  const dispatch = useIODispatch();
  const queueValue = useIOSelector(state =>
    singleInitiativeQueueValueSelector(state, item.initiativeId)
  );

  const statusLabels = {
    [StatusEnum.PENDING_DEACTIVATION_REQUEST]: "In disattivazione..",
    [StatusEnum.PENDING_ENROLLMENT_REQUEST]: "In attivazione..",
    [StatusEnum.ENROLLMENT_FAILED]: "Attivazione fallita"
  };

  const renderSwitchOrStatusLabel = () => {
    switch (item.status) {
      case StatusEnum.ACTIVE:
      case StatusEnum.INACTIVE:
        return (
          <RemoteSwitch
            onValueChange={updateInitiativeStatus}
            value={getRemoteSwitchValue()}
          />
        );
      case StatusEnum.PENDING_ENROLLMENT_REQUEST:
      case StatusEnum.PENDING_DEACTIVATION_REQUEST:
      case StatusEnum.ENROLLMENT_FAILED:
        return (
          <NBbadge style={styles.badge}>
            <LabelSmall color="white">{statusLabels[item.status]}</LabelSmall>
          </NBbadge>
        );

      default:
        return null;
    }
  };

  const getRemoteSwitchValue = () => {
    const isItemActive = item.status === StatusEnum.ACTIVE;
    switch (queueValue) {
      case undefined:
        return pot.some(isItemActive);
      case true:
        return pot.someLoading(isItemActive);
      case false:
        return pot.someUpdating(isItemActive, !isItemActive);
      default:
        return pot.none;
    }
  };

  const updateInitiativeStatus = () => {
    if (item.status === StatusEnum.ACTIVE) {
      dispatch(
        idpayInitiativesPairingDelete.request({
          idWallet,
          initiativeId: item.initiativeId
        })
      );
    } else if (item.status === StatusEnum.INACTIVE) {
      dispatch(
        idpayInitiativesPairingPut.request({
          idWallet,
          initiativeId: item.initiativeId
        })
      );
    }
  };

  return (
    <NBlistItem style={{ justifyContent: "space-between", paddingRight: 0 }}>
      <H4>{item.initiativeName}</H4>
      {renderSwitchOrStatusLabel()}
    </NBlistItem>
  );
};
