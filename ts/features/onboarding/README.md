# Onboarding Feature

## Purpose

This directory encapsulates code related to the application's user onboarding functionality. This includes user registration, initial setup flows, and other mechanisms used to guide new users through the application.

## Rationale (Refactoring Context)

As part of a codebase refactoring initiative, these files were grouped together to:

1. **Improve Cohesion:** Consolidate onboarding logic (UI, state, navigation, services, types, etc.) into one logical location.
2. **Enhance Discoverability:** Make it easier and faster for developers to locate and understand code related to user onboarding.
3. **Simplify Maintenance:** Streamline bug fixing, updates, and future enhancements by isolating onboarding-related code.

## Contents

This feature module typically includes:

* Onboarding-related UI screens.
* State management logic specific to user onboarding (actions, reducers, selectors).
* Utility functions and components used exclusively within the onboarding flows.
* Sagas for handling asynchronous onboarding-related logic.

## Guideline

* All **new** code **strictly** concerning user onboarding functionality (new screens, onboarding-specific logic, state management for onboarding, etc.) should reside directly within this `onboarding` feature module.
* Avoid creating unnecessary subdirectories unless the codebase grows significantly and requires further organization.

## Folder structure

The current folder structure is as follows:

``` bash
onboarding/
├── components/ # UI components specific to onboarding
├── screens/    # Screens for onboarding flows
├── store/      # State management (actions, reducers, selectors)
│   ├── actions/
│   ├── reducers/
│   ├── selectors/
├── sagas/      # Asynchronous logic and side effects
├── utils/      # Utility functions specific to onboarding
└── __tests__/  # Unit tests for onboarding logic
```

This structure ensures that all onboarding-related code is organized and easy to navigate.