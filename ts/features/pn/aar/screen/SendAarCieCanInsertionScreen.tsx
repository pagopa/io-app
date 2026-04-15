import { Body, OTPInput, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import i18n from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import cieCanEducationalSource from "../../../../../img/features/pn/cieCanEducational.png";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { trackSendAarMandateCieCanEnter } from "../analytics";
import { setAarFlowState } from "../store/actions";
import {
  aarAdresseeDenominationSelector,
  currentAarFlowData
} from "../store/selectors";
import { sendAarFlowStates } from "../utils/stateUtils";

export const CIE_CAN_LENGTH = 6;

export type SendAarCieCanInsertionScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION
>;

const { width, height, uri } = Image.resolveAssetSource(
  cieCanEducationalSource
);
const aspectRatio = width / height;

export const SendAarCieCanInsertionScreen = ({
  navigation
}: SendAarCieCanInsertionScreenProps) => {
  const dispatch = useIODispatch();
  const [can, setCan] = useState("");
  const canPadViewRef = useRef<View>(null);
  const currentAarState = useIOSelector(currentAarFlowData);
  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  useEffect(() => {
    switch (currentAarState.type) {
      case sendAarFlowStates.cieCanAdvisory: {
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL, {
          animationTypeForReplace: "pop"
        });
        break;
      }
      case sendAarFlowStates.cieScanningAdvisory: {
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL, {
          animationTypeForReplace: "push"
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
        currentAarState.type === sendAarFlowStates.cieCanInsertion
      ) {
        Keyboard.dismiss();

        dispatch(
          setAarFlowState({
            ...currentAarState,
            type: sendAarFlowStates.cieScanningAdvisory,
            can: value
          })
        );
      }
    },
    [currentAarState, dispatch]
  );

  const handleGoBack = useCallback(() => {
    if (currentAarState.type === sendAarFlowStates.cieCanInsertion) {
      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: sendAarFlowStates.cieCanAdvisory
        })
      );
    }
  }, [currentAarState, dispatch]);

  useHardwareBackButtonWhenFocused(() => {
    handleGoBack();
    return true;
  });

  const denomination = useIOSelector(aarAdresseeDenominationSelector);

  const CanLocationBottomSheetContent = () => (
    <VStack space={24}>
      <Body>
        {i18n.t("features.pn.aar.flow.cieCanInsertion.bottomSheet.info", {
          denomination
        })}
      </Body>
      <Image
        accessibilityIgnoresInvertColors
        source={{
          uri
        }}
        style={{
          aspectRatio
        }}
      />
    </VStack>
  );

  const { bottomSheet, present: presentCanLocationBottomSheet } =
    useIOBottomSheetModal({
      title: i18n.t("features.pn.aar.flow.cieCanInsertion.bottomSheet.title"),
      component: <CanLocationBottomSheetContent />
    });

  const handleDescriptionLinkPress = useCallback(
    (url: string) => {
      if (url === "internal://can-location") {
        presentCanLocationBottomSheet();
      }
    },
    [presentCanLocationBottomSheet]
  );

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <IOScrollViewWithLargeHeader
          alwaysBounceVertical={false}
          contextualHelp={{
            title: i18n.t(
              "features.pn.aar.flow.delegated.cieContextualHelp.title"
            ),
            body: i18n.t(
              "features.pn.aar.flow.delegated.cieContextualHelp.body"
            )
          }}
          description={i18n.t(
            "features.pn.aar.flow.cieCanInsertion.description"
          )}
          goBack={handleGoBack}
          headerActionsProp={{ showHelp: true }}
          includeContentMargins
          onDescriptionLinkPress={handleDescriptionLinkPress}
          title={{
            label: i18n.t("features.pn.aar.flow.cieCanInsertion.title")
          }}
        >
          <VSpacer size={8} />
          <OTPInput
            accessibilityHint={i18n.t(
              "authentication.cie.pin.accessibility.hint"
            )}
            accessibilityLabel={i18n.t(
              "authentication.cie.pin.accessibility.label"
            )}
            autoFocus={isFocused}
            key={isFocused ? "focused" : "unfocused"}
            length={CIE_CAN_LENGTH}
            onValueChange={handleCanChange}
            ref={canPadViewRef}
            secret
            value={can}
          />
        </IOScrollViewWithLargeHeader>
      </KeyboardAvoidingView>
      {bottomSheet}
    </SafeAreaView>
  );
};
