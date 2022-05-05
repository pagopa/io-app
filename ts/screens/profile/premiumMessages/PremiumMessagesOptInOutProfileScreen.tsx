import React, { useCallback, useMemo } from "react";
import { SafeAreaView, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Content } from "native-base";
import {
  isPremiumMessagesAcceptedSelector,
  setPremiumMessagesAccepted
} from "../../../sagas/premiumMessages";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { BlockButtonProps } from "../../../components/ui/BlockButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

type Props = void;

/**
 * The screen used to handle the user's agreement to
 * the Premium Messages feature in the profile section.
 */
export const PremiumMessagesOptInOutProfileScreen = (_: Props) => {
  const dispatch = useDispatch();
  const premiumMessagesAccepted = useSelector(
    isPremiumMessagesAcceptedSelector
  );

  const handleSubmit = useCallback(
    (value: boolean) => dispatch(setPremiumMessagesAccepted(value)),
    [dispatch]
  );

  const footerButtonProps = useMemo<BlockButtonProps>(
    () =>
      premiumMessagesAccepted
        ? cancelButtonProps(() => handleSubmit(false), "Don't share")
        : confirmButtonProps(() => handleSubmit(true), "Share"),
    [handleSubmit, premiumMessagesAccepted]
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle="Premium Messages Opt-in/out"
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content>
          <Text>Premium Messages Opt-in/out</Text>
        </Content>

        <FooterWithButtons type="SingleButton" leftButton={footerButtonProps} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
