import { OTPInput, VSpacer } from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import i18n from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { trackSendAarMandateCieCanEnter } from "../analytics";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

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
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL, {
          animationTypeForReplace: "push"
        });
        break;
      }
      case sendAARFlowStates.cieCanAdvisory: {
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL, {
          animationTypeForReplace: "pop"
        });
        break;
      }
      default:
        break;
    }
  }, [currentAarState.type, navigation]);

  useFocusEffect(
    useCallback(() => {
      trackSendAarMandateCieCanEnter();
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

  useHardwareBackButtonWhenFocused(() => {
    handleGoBack();
    return true;
  });

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
