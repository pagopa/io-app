import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView } from "react-native";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  BeneficiaryDetailsContent,
  BeneficiaryDetailsContentSkeleton
} from "../components/BeneficiaryDetailsContent";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idPayBeneficiaryDetailsSelector,
  idpayInitiativeDetailsSelector
} from "../store";
import { idPayBeneficiaryDetailsGet } from "../store/actions";

export type BeneficiaryDetailsScreenParams = {
  initiativeId: string;
  initiativeName?: string;
};

type BeneficiaryDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_BENEFICIARY"
>;

const BeneficiaryDetailsScreen = () => {
  const route = useRoute<BeneficiaryDetailsScreenRouteProps>();

  const { initiativeId, initiativeName } = route.params;

  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(idPayBeneficiaryDetailsGet.request({ initiativeId }));
  });

  const beneficiaryDetailsPot = useIOSelector(idPayBeneficiaryDetailsSelector);
  const initiativeDetailsPot = useIOSelector(idpayInitiativeDetailsSelector);

  const content = pipe(
    sequenceS(O.Monad)({
      initiativeDetails: pipe(initiativeDetailsPot, pot.toOption),
      beneficiaryDetails: pipe(beneficiaryDetailsPot, pot.toOption)
    }),
    O.fold(
      () => <BeneficiaryDetailsContentSkeleton />,
      props => <BeneficiaryDetailsContent {...props} />
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

  return (
    <BaseScreenComponent goBack={true} headerTitle={headerTitle}>
      <ScrollView scrollIndicatorInsets={{ right: 1 }}>
        <ContentWrapper>{content}</ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
  );
};

export default BeneficiaryDetailsScreen;
