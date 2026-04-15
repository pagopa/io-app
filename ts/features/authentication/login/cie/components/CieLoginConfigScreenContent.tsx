import { ListItemCheckbox } from "@pagopa/io-app-design-system";
import { CieEntityIds } from "../components/CieRequestAuthenticationOverlay";
import { cieLoginDisableUat, cieLoginEnableUat } from "../store/actions";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";

const CieLoginConfigScreenContent = () => {
  const dispatch = useIODispatch();
  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  return (
    <ListItemCheckbox
      icon="warningFilled"
      selected={useCieUat}
      onValueChange={newValue => {
        if (newValue) {
          dispatch(cieLoginEnableUat());
        } else {
          dispatch(cieLoginDisableUat());
        }
      }}
      value={`Abilita endpoint di collaudo (${CieEntityIds.DEV})`}
      description={
        "Questa opzione serve agli sviluppatori, per testare la login con CIE."
      }
      accessibilityLabel={""}
    />
  );
};

export default CieLoginConfigScreenContent;
