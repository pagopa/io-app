import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { useIODispatch } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { IDPayDetailsParamsList } from "../navigation";
import { idPayBeneficiaryDetailsGet } from "../store/actions";

export type BeneficiaryDetailsScreenParams = {
  initiativeId: string;
};

type BeneficiaryDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_BENEFICIARY"
>;

const BeneficiaryDetailsScreen = () => {
  const route = useRoute<BeneficiaryDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(idPayBeneficiaryDetailsGet.request({ initiativeId }));
  });

  return (
    <BaseScreenComponent goBack={true} headerTitle={""}></BaseScreenComponent>
  );
};

export default BeneficiaryDetailsScreen;
