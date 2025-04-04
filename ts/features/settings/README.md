# Settings Feature

## Purpose

This directory aims to encapsulate code primarily related to the application's user settings functionality. This includes user profile adjustments, notification preferences, appearance settings, data management options, and other configuration interfaces available to the user.

## Rationale (Refactoring Context)

As part of a codebase refactoring initiative, these files were grouped together to:

1.  **Improve Cohesion:** Keep related settings logic (UI, state, navigation, services, types, etc.) consolidated in one logical location.
2.  **Enhance Discoverability:** Make it significantly easier and faster for developers to locate and understand code pertaining to the settings section.
3.  **Simplify Maintenance:** Streamline bug fixing, updates, and future enhancements related to user settings by isolating their relevant code.

During this refactoring, it was identified that some components, hooks, or utility functions historically associated with 'Profile' are also utilized in other, unrelated parts of the application. Fully decoupling and refactoring all usages of these shared elements immediately was assessed as being too time-consuming and introducing unnecessary risk at this stage.

## Contents

This feature module typically includes:

*   Settings-related UI screens.
*   State management logic specific to user preferences and settings state.
*   Navigation configuration specific to the settings section.
*   Custom hooks used exclusively within the settings flows.

### Important Note on the `shared` Subdirectory

This feature contains a `shared` subdirectory (i.e., `features/settings/**/shared/`). This directory holds components, hooks, or utilities that, while potentially originating from or heavily used within the 'Settings' context, are **also consumed by other features** of the application.

## Guideline

*   All **new** code **strictly** concerning user settings functionality (new screens, settings-specific logic, state management for preferences, etc.) should reside directly within this `settings` feature module (but outside the `shared` subdirectory unless explicitly intended for cross-feature use from the outset).
*   Before adding code to the `settings/**/shared` directory, carefully consider if it's truly specific to settings but needed *elsewhere*, or if it's generic enough to potentially belong in a top-level shared location later.
*   Treat the `settings/**/shared` directory primarily as a holding area for **existing** shared code identified during this refactor phase. Avoid using it as the default location for newly created shared components if a more appropriate global shared location exists or can be created.
*   Aim to gradually reduce the contents of `settings/**/shared` over time by refactoring components into more appropriate locations (either fully within `settings` if usage becomes exclusive, or into a global `shared` directory).
*   

## Folder structure

Each subfolder can have the following structure:

``` bash
settings/
├── featureOne/
│   ├── screens/ # Screens specific to the feature
│   ├── components/ # Feature-specific UI components 
│   ├── store/ # State, actions and reducers
│   ├── sagas/ # Async logic and side effects 
│   ├── hooks/ # React hooks local to the feature 
│   └── shared/ # Code reused only across all features
├── featureTwo/
│   └── ...
└── ...

```