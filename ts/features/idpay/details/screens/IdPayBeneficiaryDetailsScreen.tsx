import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { IdPayBeneficiaryDetailsContent } from "../components/IdPayBeneficiaryDetailsContent";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idPayBeneficiaryDetailsSelector,
  idpayInitiativeDetailsSelector
} from "../store";
import {
  idPayBeneficiaryDetailsGet,
  idPayOnboardingStatusGet
} from "../store/actions";
import { IOScrollView } from "../../../../components/ui/IOScrollView";

export type IdPayBeneficiaryDetailsScreenParams = {
  initiativeId: string;
  initiativeName?: string;
};

type IdPayBeneficiaryDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_BENEFICIARY"
>;

const IdPayBeneficiaryDetailsScreen = () => {
  const route = useRoute<IdPayBeneficiaryDetailsScreenRouteProps>();

  const { initiativeId, initiativeName } = route.params;

  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(idPayBeneficiaryDetailsGet.request({ initiativeId }));
    dispatch(idPayOnboardingStatusGet.request({ initiativeId }));
  });

  const beneficiaryDetailsPot = useIOSelector(idPayBeneficiaryDetailsSelector);
  const initiativeDetailsPot = useIOSelector(idpayInitiativeDetailsSelector);

  const content = pipe(
    sequenceS(O.Monad)({
      initiativeDetails: pipe(initiativeDetailsPot, pot.toOption),
      beneficiaryDetails: pipe(beneficiaryDetailsPot, pot.toOption)
    }),
    O.fold(
      () => <IdPayBeneficiaryDetailsContent isLoading={true} />,
      props => <IdPayBeneficiaryDetailsContent {...props} />
    )
  );

  const headerTitle = pipe(
    initiativeDetailsPot,
    pot.toOption,
    O.fold(
      () => initiativeName,
      details => details.initiativeName
    )
  );

  useHeaderSecondLevel({
    title: headerTitle || "",
    supportRequest: true,
    enableDiscreteTransition: true
  });

  return (
    <IOScrollView>
      <VSpacer size={16} />
      {content}
    </IOScrollView>
  );
};

export { IdPayBeneficiaryDetailsScreen };
