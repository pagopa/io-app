import {
  GradientScrollView,
  H2,
  HeaderSecondLevel,
  IOPaymentLogos,
  ListItemHeader,
  ListItemRadio,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView } from "react-native";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletInfoDetails1 } from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ComponentProps } from "../../../../types/react";
import { findFirstCaseInsensitive } from "../../../../utils/object";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetUserWallets
} from "../store/actions/networking";
import { walletPaymentPickPaymentMethod } from "../store/actions/orchestration";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);
  const canContinue = O.isSome(selectedMethodOption);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetAllMethods.request());
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const handleMethodSelection = React.useCallback(
    (wallet: WalletInfo) => {
      dispatch(walletPaymentPickPaymentMethod(wallet));
    },
    [dispatch]
  );

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP,
      params: {
        walletId: "123456",
        paymentAmountInCents: 100
      }
    });
  };
  // IOIcons or IOLogoPaymentType
  const getIconWithFallback = (
    brand?: string
  ): ComponentProps<typeof ListItemRadio>["startImage"] => {
    const logos = IOPaymentLogos;
    return pipe(
      brand,
      O.fromNullable,
      O.chain(findFirstCaseInsensitive(logos)),
      O.map(([brand]) => brand),
      O.fold(
        () => ({ icon: "creditCard" }),
        brand => ({ paymentLogo: brand as IOPaymentLogos })
      )
    );
  };

  const mapNotSavedToRadioItem = (
    method: PaymentMethodResponse
  ): RadioItem<string> => ({
    id: method.id,
    value: method.name,
    startImage: getIconWithFallback(method.asset)
  });
  const mapSavedToRadioItem = (method: WalletInfo): RadioItem<string> => {
    switch (method.details?.type) {
      case "CARDS":
        const cardDetails = method.details as WalletInfoDetails1;
        return {
          id: method.walletId,
          value: cardDetails.brand,
          startImage: getIconWithFallback(cardDetails.brand)
        };
      case "PAYPAL":
        return {
          id: method.walletId,
          value: "PayPal",
          startImage: getIconWithFallback("paypal")
        };
      case "BANCOMATPAY":
        return {
          id: method.walletId,
          value: "BANCOMAT Pay",
          startImage: getIconWithFallback("bancomatpay")
        };
    }
  };
  const loadingRadios: Array<RadioItem<string>> = [
    {
      id: "123456",
      disabled: true,
      loadingProps: { state: true },
      value: "123456"
    }
  ];
  const notSavedMethods = pipe(
    paymentMethodsPot,
    pot.toOption,
    O.fold(
      () => [],
      methods => methods.map(mapNotSavedToRadioItem)
    )
    // O.map(a => a.),
    // O.getOrElse(loadingRadios)
  );
  const savedMethods = pipe(
    userWalletsPots,
    pot.toOption,
    O.fold(
      () => [],
      methods => methods.map(mapSavedToRadioItem)
    )
  );
  // TODO just for testing purposes
  // React.useEffect(() => {
  //   if (pot.isSome(userWalletsPots) && !canContinue) {
  //     const userWallets = userWalletsPots.value;

  //     // userWallets[0].
  //     if (userWallets.length > 0) {
  //       handleMethodSelection(userWallets[0]);
  //       // console.log(userWallets[0]);
  //     }
  //   }
  // }, [userWalletsPots, canContinue, handleMethodSelection]);

  // const mapToRadioItem = (wallet: WalletInfo): RadioItem<string> => {
  // switch(wallet.details?.type){
  //   case TypeEnu
  // }

  //  return{ id: wallet.walletId,
  //   value: wallet.}
  // };

  return (
    <>
      <SafeAreaView>
        <HeaderSecondLevel
          backAccessibilityLabel="Torna indietro"
          goBack={navigation.goBack}
          title=""
          type="base"
        />
      </SafeAreaView>

      <GradientScrollView
        primaryActionProps={{
          label: "Continua",
          accessibilityLabel: "Continua",
          onPress: handleContinue,
          disabled: isLoading || !canContinue,
          loading: isLoading
        }}
      >
        <H2>SCEGLI METODO</H2>
        <VSpacer size={16} />
        <ListItemHeader label="I TUOI METODI" />

        <RadioGroup<string> items={savedMethods} onPress={() => void null} />

        <ListItemHeader label="ALTRI METODI" />

        <RadioGroup<string>
          items={notSavedMethods}
          onPress={() => void null}
          // onPress={handleMethodSelection}
        />
        <DebugPrettyPrint title="paymentMethodsPot" data={paymentMethodsPot} />
        <VSpacer size={16} />
        <DebugPrettyPrint title="userWalletsPots" data={userWalletsPots} />
      </GradientScrollView>
    </>
  );
};

export { WalletPaymentPickMethodScreen };
