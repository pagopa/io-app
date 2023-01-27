import { createActionsImplementation } from "../actions";

export const mockNavigateToConfigurationIntro = jest.fn();

export const mockNavigateToIbanEnrollmentScreen = jest.fn();

export const mockNavigateToIbanLandingScreen = jest.fn();

export const mockNavigateToIbanOnboardingScreen = jest.fn();

export const mockNavigateToInstrumentsEnrollmentScreen = jest.fn();

export const mockNavigateToConfigurationSuccessScreen = jest.fn();

export const mockNavigateToInitiativeDetailScreen = jest.fn();

export const mockExitConfiguration = jest.fn();

export type MockActionsType = ReturnType<typeof createActionsImplementation>;

export const mockActions: MockActionsType = {
  navigateToConfigurationIntro: mockNavigateToConfigurationIntro,
  navigateToIbanOnboardingScreen: mockNavigateToIbanOnboardingScreen,
  exitConfiguration: mockExitConfiguration,
  navigateToConfigurationSuccessScreen:
    mockNavigateToConfigurationSuccessScreen,
  navigateToIbanEnrollmentScreen: mockNavigateToIbanEnrollmentScreen,
  navigateToIbanLandingScreen: mockNavigateToIbanLandingScreen,
  navigateToInitiativeDetailScreen: mockNavigateToInitiativeDetailScreen,
  navigateToInstrumentsEnrollmentScreen:
    mockNavigateToInstrumentsEnrollmentScreen
};
