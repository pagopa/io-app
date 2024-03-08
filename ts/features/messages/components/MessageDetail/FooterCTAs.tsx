import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IOColors,
  IOSpacingScale,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getMessageCTA } from "../../utils/messages";
import { useIOSelector } from "../../../../store/hooks";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { serviceMetadataByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { usePNOptInMessage } from "../../hooks/usePNOptInMessage";
import { ExtractedCtas } from "../../../../components/cta/ExtractedCTAs";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
    // This Magic number is an heritage of the app code-base, this component should be removed in favor of `GradientBottomAction`
    marginTop: -50,
    paddingTop: 50
  },
  footerShadow: {
    backgroundColor: IOColors.white,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    // iOS shadow
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 50
    },
    shadowOpacity: 0.5,
    shadowRadius: 37,
    elevation: 20 // Prop supported on Android only
  }
});

const verticalSpacing: IOSpacingScale = 16;

type FooterCTAsProps = {
  markdown: string;
  serviceId: ServiceId;
};

/**
 * Render a component that show buttons as sticky footer
 * It can include 1 or 2 buttons
 */
export const FooterCTAs = ({ markdown, serviceId }: FooterCTAsProps) => {
  const insets = useSafeAreaInsets();

  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const ctas = pipe(
    getMessageCTA(markdown, serviceMetadata, serviceId),
    O.toUndefined
  );

  const { isPNOptIn } = usePNOptInMessage(serviceId);

  /* Check if the iPhone bottom handle is present.
  If not add a default margin to prevent the
  button from sticking to the bottom. */
  const bottomMargin: number = useMemo(
    () => (insets.bottom === 0 ? verticalSpacing : insets.bottom),
    [insets]
  );

  if (ctas === undefined) {
    return null;
  }

  return (
    <View
      accessible={true}
      pointerEvents={"box-none"}
      style={styles.container}
      testID="footer-ctas-bar"
    >
      <View
        style={[
          styles.footerShadow,
          { paddingBottom: bottomMargin, paddingTop: verticalSpacing }
        ]}
      >
        <ExtractedCtas
          ctas={ctas}
          isPNOptIn={isPNOptIn}
          serviceId={serviceId}
        />
      </View>
    </View>
  );
};
