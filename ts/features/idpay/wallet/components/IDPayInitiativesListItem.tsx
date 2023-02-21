import * as React from "react";
import { InitiativeDTO } from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import ListItemComponent from "../../../../components/screens/ListItemComponent";

type ListItemProps = {
  item: InitiativeDTO;
};
export const IDPayInitiativeListItem = ({ item }: ListItemProps) => {
  const [isActive, setIsActive] = React.useState(false);
  const changeActiveState = () => setIsActive(_ => !_);
  return (
    <ListItemComponent
      accessibilityRole="switch"
      isLongPressEnabled={true}
      onSwitchValueChanged={changeActiveState}
      switchValue={isActive}
      title={item.initiativeName ?? ""}
      // the list is already filtered when passed to the screen,
      // so realistically the name is never undefined
    />
  );
};
