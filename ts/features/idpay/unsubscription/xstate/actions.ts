import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayUnsubscriptionRoutes } from "../navigation/navigator";
import { Context } from "./context";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfirmationScreen = (context: Context) =>
    pipe(
      context.initiativeId,
      O.fold(
        () => {
          throw new Error("initiativeId is undefined");
        },
        initiativeId =>
          navigation.navigate(
            IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN,
            {
              screen:
                IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION,
              params: {
                initiativeId,
                initiativeName: context.initiativeName
              }
            }
          )
      )
    );

  const navigateToSuccessScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE
    });

  const exitUnsubscription = () => {
    navigation.pop();
  };

  const exitToWallet = () => {
    navigation.pop();
    navigation.pop();
  };

  return {
    navigateToConfirmationScreen,
    navigateToFailureScreen,
    navigateToSuccessScreen,
    exitUnsubscription,
    exitToWallet
  };
};

export { createActionsImplementation };
