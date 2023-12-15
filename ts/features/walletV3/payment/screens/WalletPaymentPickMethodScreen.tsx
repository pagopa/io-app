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
import React, { useMemo } from "react";
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

// ----------------- SCREEN -----------------

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [selectedSavedMethod, setSelectedSavedMethod] = React.useState<
    string | undefined
  >(undefined);
  const [selectedGenericMethod, setSelectedGenericMethod] = React.useState<
    string | undefined
  >(undefined);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetAllMethods.request());
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);

  const canContinue = O.isSome(selectedMethodOption);

  // ------------------------ HANDLERS --------------------------

  const handleSelectSavedMethod = (walletId: string) => {
    setSelectedSavedMethod(walletId);
    setSelectedGenericMethod(undefined);
    pipe(
      userWalletsPots,
      pot.toOption,
      O.map(methods =>
        O.fromNullable(methods.find(method => method.walletId === walletId))
      ),
      O.flatten,
      O.fold(
        () => void null,
        method => {
          dispatch(walletPaymentPickPaymentMethod(method));
        }
      )
    );
  };

  const handleSelectNotSavedMethod = (id: string) => {
    setSelectedSavedMethod(undefined);
    setSelectedGenericMethod(id);
    pipe(
      paymentMethodsPot,
      pot.toOption,
      O.map(methods =>
        O.fromNullable(methods.find(method => method.id === id))
      ),
      O.flatten,
      O.fold(
        () => void null,
        method => {
          dispatch(walletPaymentPickPaymentMethod(method));
        }
      )
    );
  };

  const handleContinue = () => {
    if (selectedGenericMethod || selectedSavedMethod) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP,
        params: {
          // has been even double checked
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          walletId: (selectedSavedMethod ?? selectedGenericMethod)!,
          paymentAmountInCents: 100
        }
      });
    }
  };

  // -------------------------- LISTITEMS --------------------------
  const savedMethodsListItems = useMemo(
    () =>
      isLoading
        ? loadingRadios
        : pipe(
            userWalletsPots,
            pot.toOption,
            O.fold(
              () => [],
              // possibly void, so we coalesce to empty array
              methods =>
                (methods.map(mapSavedToRadioItem) ?? []) as Array<
                  RadioItem<string>
                >
            )
          ),
    [isLoading, userWalletsPots]
  );
  const notSavedMethodsListItems = useMemo(
    () =>
      isLoading
        ? loadingRadios
        : pipe(
            paymentMethodsPot,
            pot.toOption,
            O.fold(
              () => [],
              methods => methods.map(mapGenericToRadioItem)
            )
          ),
    [isLoading, paymentMethodsPot]
  );

  // -------------------------- RENDER --------------------------

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

        <RadioGroup<string>
          selectedItem={selectedSavedMethod}
          items={savedMethodsListItems}
          onPress={handleSelectSavedMethod}
        />

        <ListItemHeader label="ALTRI METODI" />

        <RadioGroup<string>
          items={notSavedMethodsListItems}
          selectedItem={selectedGenericMethod}
          onPress={handleSelectNotSavedMethod}
        />
        <DebugPrettyPrint title="paymentMethodsPot" data={paymentMethodsPot} />
        <VSpacer size={16} />
        <DebugPrettyPrint title="userWalletsPots" data={userWalletsPots} />
      </GradientScrollView>
    </>
  );
};

// ------------------------------ UTILS --------------------------------

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
      // @ts-expect-error ts whines because this function can return
      // two different -- both correct -- types
      brand => ({ paymentLogo: brand as IOPaymentLogos })
    )
  );
};

const mapGenericToRadioItem = (
  method: PaymentMethodResponse
): RadioItem<string> => ({
  id: method.id,
  value: method.name,
  startImage: getIconWithFallback(method.asset)
});

// should never return void, but since this is a map function it's not a big deal
const mapSavedToRadioItem = (method: WalletInfo): RadioItem<string> | void => {
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
    default:
      void null;
  }
};

const loadingRadios: Array<RadioItem<string>> = [
  {
    id: "1",
    disabled: true,
    loadingProps: { state: true },
    value: "123456"
  },

  {
    id: "2",
    disabled: true,
    loadingProps: { state: true },
    value: "123456"
  },
  {
    id: "3",
    disabled: true,
    loadingProps: { state: true },
    value: "123456"
  }
];

// ------------- EXPORTS -------------

export { WalletPaymentPickMethodScreen };
