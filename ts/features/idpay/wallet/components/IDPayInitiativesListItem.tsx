import * as pot from "@pagopa/ts-commons/lib/pot";
import { ListItem as NBlistItem } from "native-base";
import * as React from "react";
import {
  InitiativesStatusDTO,
  StatusEnum
} from "../../../../../definitions/idpay/wallet/InitiativesStatusDTO";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import { H4 } from "../../../../components/core/typography/H4";
import { useIOSelector } from "../../../../store/hooks";
import {
  isSingleInitiativeLoadingSelector,
  singleInitiativeQueueValueSelector
} from "../store/reducers";

type ListItemProps = {
  item: InitiativesStatusDTO;
};
export const IDPayInitiativeListItem = ({ item }: ListItemProps) => {
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

  return (
    <NBlistItem style={{ justifyContent: "space-between", paddingRight: 0 }}>
      <H4>{item.initiativeName}</H4>
      <RemoteSwitch value={switchPot()} />
    </NBlistItem>
  );
};
