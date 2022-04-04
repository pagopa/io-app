import React, { useCallback } from "react";
import { SafeAreaView, Text } from "react-native";
import { Content } from "native-base";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { setPremiumMessagesAccepted } from "../../../sagas/premiumMessages";

type Props = void;

/**
 * The screen used to handle the user's agreement to
 * the Premium Messages feature.
 */
export const PremiumMessagesOptInOutScreen = (_: Props) => {
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    () => dispatch(setPremiumMessagesAccepted()),
    [dispatch]
  );

  return (
    <SafeAreaView style={IOStyles.flex}>
      <Content>
        <Text>Premium Messages Opt-in/out</Text>
      </Content>

      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={{
          light: true,
          bordered: true,
          onPress: handleSubmit,
          title: "No"
        }}
        rightButton={{
          onPress: handleSubmit,
          title: "Yes"
        }}
      />
    </SafeAreaView>
  );
};
