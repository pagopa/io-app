import { createActionsImplementation } from "../actions";

export type MockActionsType = ReturnType<typeof createActionsImplementation>;

export const mockActions: MockActionsType = {
  navigateToConfigurationIntro: jest.fn(),
  navigateToIbanOnboardingScreen: jest.fn(),
  exitConfiguration: jest.fn(),
  navigateToConfigurationSuccessScreen: jest.fn(),
  navigateToIbanEnrollmentScreen: jest.fn(),
  navigateToIbanLandingScreen: jest.fn(),
  navigateToInitiativeDetailScreen: jest.fn(),
  navigateToInstrumentsEnrollmentScreen: jest.fn()
};
