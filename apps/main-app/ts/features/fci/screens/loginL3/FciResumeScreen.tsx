import LoadingComponent from "../../components/LoadingComponent";

/**
 * The saga navigates here after L3 active-session login so that FciRouterScreen
 * and SuccessComponent are unmounted during the transition avoiding double requests.
 */
const FciResumeScreen = () => (
  <LoadingComponent testID="FciResumeScreenTestID" />
);

export default FciResumeScreen;
