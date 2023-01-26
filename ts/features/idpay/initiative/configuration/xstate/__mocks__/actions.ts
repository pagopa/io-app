import { createActionsImplementation } from "../actions";

// Mocked actions
export const mockNavigateToConfigurationIntro = jest.fn();
export const mockNavigateToIbanLandingScreen = jest.fn();
export const mockNavigateToIbanOnboardingScreen = jest.fn();
export const mockNavigateToIbanEnrollmentScreen = jest.fn();
export const mockNavigateToAddPaymentMethodScreen = jest.fn();
export const mockNavigateToInstrumentsEnrollmentScreen = jest.fn();
export const mockNavigateToConfigurationSuccessScreen = jest.fn();
export const mockNavigateToInitiativeDetailScreen = jest.fn();
export const mockExitConfiguration = jest.fn();

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
