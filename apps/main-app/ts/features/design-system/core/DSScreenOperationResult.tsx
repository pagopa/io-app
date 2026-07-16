import UnlockAccessComponent from "../../authentication/login/unlockAccess/components/UnlockAccessComponent";

// TEMPORARY (do not commit): pointed at UnlockAccessComponent to compare the
// CustomWizardScreen -> IOScrollViewCentredContent migration. Revert with:
//   git checkout -- apps/main-app/ts/features/design-system/core/DSScreenOperationResult.tsx
const DSScreenOperationResult = () => <UnlockAccessComponent authLevel="L2" />;

export { DSScreenOperationResult };
