import { VSpacer } from "@pagopa/io-app-design-system";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

export const LoaderComponent = () => (
  <LoadingSpinnerOverlay isLoading={true} loadingOpacity={1.0}>
    <VSpacer size={16} />
  </LoadingSpinnerOverlay>
);
