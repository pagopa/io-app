import React from "react";
import { useDispatch } from "react-redux";
import { CheckboxListItem } from "../../../../components/ui/CheckboxListItem";
import { Divider } from "../../../../components/core/Divider";
import { CieEntityIds } from "../../../../components/cie/CieRequestAuthenticationOverlay";
import { cieLoginDisableUat, cieLoginEnableUat } from "../../store/actions";
import { isCieLoginUatEnabledSelector } from "../../store/selectors";
import { useIOSelector } from "../../../../store/hooks";

const CieLoginConfigScreenContent = () => {
  const dispatch = useDispatch();
  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  return (
    <>
      <CheckboxListItem
        selected={useCieUat}
        onValueChange={newValue => {
          if (newValue) {
            dispatch(cieLoginEnableUat());
          } else {
            dispatch(cieLoginDisableUat());
          }
        }}
        value={`Abilita endpoint di collaudo (${CieEntityIds.DEV})`}
        accessibilityLabel={""}
      />
      <Divider />
    </>
  );
};

export default CieLoginConfigScreenContent;
