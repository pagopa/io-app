import { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../store/reducers/types";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { onboardingBancomatAddedPansSelector } from "../onboarding/bancomat/store/reducers/addedPans";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Handle the notification for a new payment method added
 * TODO: add other methods, handle only bancomat atm
 * @constructor
 */
const NewPaymentMethodAddedNotifier = (props: Props) => {
  const navigation = useNavigationContext();
  // Save the latest visualized bottomsheet, in order to avoid to show it again if focus changed
  const [lastNotifiedBancomatHash, setLastNotifiedBancomatHash] = useState<
    string
  >("");

  useEffect(() => {
    if (navigation.isFocused()) {
      const lastAddedHash = props.addedBancomat.reduce(
        (acc, val) => acc + val.idWallet.toString(),
        ""
      );
      // a new set of bancomat has been added and no bottomsheet has been dispayed
      if (lastAddedHash !== "" && lastNotifiedBancomatHash !== lastAddedHash) {
        setLastNotifiedBancomatHash(lastAddedHash);
        console.log(lastAddedHash);
      }
    }
  }, [navigation.isFocused()]);

  return null;
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  addedBancomat: onboardingBancomatAddedPansSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewPaymentMethodAddedNotifier);
