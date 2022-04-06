import React, { useCallback } from "react";
import { SafeAreaView, Text } from "react-native";
import { Content } from "native-base";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { setPremiumMessagesAccepted } from "../../../sagas/premiumMessages";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";

type Props = void;

/**
 * The screen used to handle the user's agreement to
 * the Premium Messages feature.
 */
export const PremiumMessagesOptInOutScreen = (_: Props) => {
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    (value: boolean) => dispatch(setPremiumMessagesAccepted(value)),
    [dispatch]
  );

  return (
    <SafeAreaView style={IOStyles.flex}>
      <Content>
        <Text>Premium Messages Opt-in/out</Text>
      </Content>

      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={cancelButtonProps(() => handleSubmit(false), "Don't share")}
        rightButton={confirmButtonProps(() => handleSubmit(true), "Share")}
      />
    </SafeAreaView>
  );
};
