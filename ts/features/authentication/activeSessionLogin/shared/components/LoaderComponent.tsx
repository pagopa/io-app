import { VSpacer } from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

export const LoaderComponent = () => (
  <LoadingSpinnerOverlay loadingOpacity={1.0} isLoading={true}>
    <VSpacer size={16} />
  </LoadingSpinnerOverlay>
);
