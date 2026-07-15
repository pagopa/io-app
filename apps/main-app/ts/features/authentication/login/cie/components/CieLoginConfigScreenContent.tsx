import { ListItemCheckbox } from "@io-app/design-system";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { CieEntityIds } from "../components/CieRequestAuthenticationOverlay";
import { cieLoginDisableUat, cieLoginEnableUat } from "../store/actions";
import { isCieLoginUatEnabledSelector } from "../store/selectors";

const CieLoginConfigScreenContent = () => {
  const dispatch = useIODispatch();
  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  return (
    <ListItemCheckbox
      accessibilityLabel={""}
      description={
        "Questa opzione serve agli sviluppatori, per testare la login con CIE."
      }
      icon="warningFilled"
      onValueChange={newValue => {
        if (newValue) {
          dispatch(cieLoginEnableUat());
        } else {
          dispatch(cieLoginDisableUat());
        }
      }}
      selected={useCieUat}
      value={`Abilita endpoint di collaudo (${CieEntityIds.DEV})`}
    />
  );
};

export default CieLoginConfigScreenContent;
