import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { Canvas } from "@shopify/react-native-skia";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { trackCredentialDetail } from "../../../analytics";
import { mapPIDStatusToMixpanel } from "../../../analytics/utils/analyticsUtils";
import {
  ItwBrandedSkiaGradient,
  ItwSkiaBrandedGradientVariant
} from "../../../common/components/ItwBrandedSkiaGradient";
import {
  ItwJwtCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { ItwPresentationDetailsScreenBase } from "../components/ItwPresentationDetailsScreenBase";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { ItwPresentationPidDetailFooter } from "../components/ItwPresentationPidDetailFooter";
import { ItwPresentationPidDetailHeader } from "../components/ItwPresentationPidDetailHeader";

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useIOSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  useFocusEffect(
    useCallback(() => {
      if (maybeEidStatus) {
        trackCredentialDetail({
          credential: "ITW_PID",
          credential_status: mapPIDStatusToMixpanel(maybeEidStatus)
        });
      }
    }, [maybeEidStatus])
  );

  const getContent = (credential: StoredCredential) => (
    <ItwPresentationDetailsScreenBase credential={credential}>
      {/* Header with logo and description */}
      <ItwPresentationPidDetailHeader />

      {/* Brand gradient below header */}
      <PidStatusGradient />

      {/* Page content */}
      <ContentWrapper>
        <VSpacer size={16} />
        <ItwPresentationPidDetail credential={credential} />
        <VSpacer size={16} />
        <ItwPresentationPidDetailFooter credential={credential} />
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );

  return pipe(pidOption, O.fold(constNull, getContent));
};

const PidStatusGradient = () => {
  const { width } = useWindowDimensions();
  const pidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const borderVariantByPidStatus: Record<
    ItwJwtCredentialStatus,
    ItwSkiaBrandedGradientVariant
  > = {
    valid: "default",
    jwtExpiring: "warning",
    jwtExpired: "error"
  };

  return (
    <Canvas style={{ width, height: 3 }}>
      <ItwBrandedSkiaGradient
        width={width}
        height={3}
        variant={borderVariantByPidStatus[pidStatus || "valid"]}
      />
    </Canvas>
  );
};
