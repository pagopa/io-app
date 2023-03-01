import * as pot from "@pagopa/ts-commons/lib/pot";
import { ListItem as NBlistItem } from "native-base";
import * as React from "react";
import {
  InitiativesStatusDTO,
  StatusEnum
} from "../../../../../definitions/idpay/wallet/InitiativesStatusDTO";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import { H4 } from "../../../../components/core/typography/H4";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { singleInitiativeQueueValueSelector } from "../store/reducers";
import { idpayInitiativesPairingPut } from "../store/actions";

type ListItemProps = {
  item: InitiativesStatusDTO;
  idWallet: string;
};
export const IDPayInitiativeListItem = ({ item, idWallet }: ListItemProps) => {
  const dispatch = useIODispatch();
  const queueValue = useIOSelector(state =>
    singleInitiativeQueueValueSelector(state, item.initiativeId)
  );

  const switchPot = () => {
    const isActive = item.status === StatusEnum.ACTIVE;
    switch (queueValue) {
      case undefined:
        return pot.some(isActive);
      case true:
        return pot.someLoading(isActive);
      case false:
        return pot.someUpdating(isActive, !isActive);
      default:
        return pot.none;
    }
  };

  const activateInitiative = () => {
    dispatch(
      idpayInitiativesPairingPut.request({
        idWallet,
        initiativeId: item.initiativeId
      })
    );
  };

  return (
    <NBlistItem style={{ justifyContent: "space-between", paddingRight: 0 }}>
      <H4>{item.initiativeName}</H4>
      <RemoteSwitch onValueChange={activateInitiative} value={switchPot()} />
    </NBlistItem>
  );
};
