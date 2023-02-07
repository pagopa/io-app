export const mockActions = {
  navigateToInitiativeDetailsScreen: jest.fn(),
  navigateToPDNDCriteriaScreen: jest.fn(),
  navigateToBoolSelfDeclarationsScreen: jest.fn(),
  navigateToMultiSelfDeclarationsScreen: jest.fn(),
  navigateToCompletionScreen: jest.fn(),
  navigateToFailureScreen: jest.fn(),
  navigateToInitiativeMonitoringScreen: jest.fn(),
  exitOnboarding: jest.fn()
};

export const mockServices = {
  loadInitiative: jest.fn(),
  loadInitiativeStatus: jest.fn(),
  acceptTos: jest.fn(),
  loadRequiredCriteria: jest.fn(),
  acceptRequiredCriteria: jest.fn()
};
