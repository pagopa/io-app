import { useCallback, useEffect, useRef, useState } from "react";
import { OTPInput, VSpacer } from "@pagopa/io-app-design-system";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import i18n from "i18next";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../utils/stateUtils";
import { currentAARFlowData } from "../store/selectors";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { PnParamsList } from "../../navigation/params";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

export const CIE_CAN_LENGTH = 6;

export type SendAarCieCanInsertionScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION
>;

export const SendAarCieCanInsertionScreen = ({
  navigation
}: SendAarCieCanInsertionScreenProps) => {
  const dispatch = useIODispatch();
  const [can, setCan] = useState("");
  const canPadViewRef = useRef<View>(null);
  const currentAarState = useIOSelector(currentAARFlowData);
  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  useEffect(() => {
    switch (currentAarState.type) {
      case sendAARFlowStates.cieScanningAdvisory: {
        navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL
          }
        });
        break;
      }
      case sendAARFlowStates.cieCanAdvisory: {
        navigation.goBack();
        break;
      }
      default:
        break;
    }
  }, [currentAarState.type, navigation]);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(canPadViewRef, 300 as Millisecond);

      return () => {
        // Reset the CAN when the user leaves the screen.
        setCan("");
      };
    }, [])
  );

  const handleCanChange = useCallback(
    (value: string) => {
      setCan(value);

      if (
        value.length === CIE_CAN_LENGTH &&
        currentAarState.type === sendAARFlowStates.cieCanInsertion
      ) {
        Keyboard.dismiss();

        dispatch(
          setAarFlowState({
            ...currentAarState,
            type: sendAARFlowStates.cieScanningAdvisory,
            can: value
          })
        );
      }
    },
    [currentAarState, dispatch]
  );

  const handleGoBack = useCallback(() => {
    if (currentAarState.type === sendAARFlowStates.cieCanInsertion) {
      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: sendAARFlowStates.cieCanAdvisory
        })
      );
    }
  }, [currentAarState, dispatch]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <IOScrollViewWithLargeHeader
          title={{
            label: i18n.t("features.pn.aar.flow.cieCanInsertion.title")
          }}
          description={i18n.t(
            "features.pn.aar.flow.cieCanInsertion.description"
          )}
          headerActionsProp={{ showHelp: true }}
          contextualHelp={{
            title: i18n.t(
              "features.pn.aar.flow.delegated.cieContextualHelp.title"
            ),
            body: i18n.t(
              "features.pn.aar.flow.delegated.cieContextualHelp.body"
            )
          }}
          goBack={handleGoBack}
          includeContentMargins
          alwaysBounceVertical={false}
        >
          <VSpacer size={8} />
          <OTPInput
            ref={canPadViewRef}
            secret
            length={CIE_CAN_LENGTH}
            onValueChange={handleCanChange}
            value={can}
            autoFocus={isFocused}
            accessibilityLabel={i18n.t(
              "authentication.cie.pin.accessibility.label"
            )}
            accessibilityHint={i18n.t(
              "authentication.cie.pin.accessibility.hint"
            )}
            key={isFocused ? "focused" : "unfocused"}
          />
        </IOScrollViewWithLargeHeader>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
