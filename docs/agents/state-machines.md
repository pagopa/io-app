# XState State Machines

This document describes the conventions for XState v5 state machines in the IO App.

## File Structure

Each machine is organized in a dedicated folder with the following files:

```
ts/features/<feature>/machine/<machine-name>/
├── machine.ts           # Machine definition with setup()
├── context.ts           # Context types and initial state
├── events.ts            # Event type definitions
├── actions.ts           # Action implementations (factory function)
├── actors.ts            # Async operations (factory function)
├── guards.ts            # Guard implementations (factory function)
├── selectors.ts         # Context selectors
├── failure.ts           # Failure types and mapping
├── provider.tsx         # React provider with dependency injection
└── __tests__/
    └── machine.test.ts  # Machine tests
```

## Machine Definition

- Machines use `setup()` to define their interface with stub implementations:
- All actions, actors, and guards are stubs (throw `notImplemented()`)
- Implementations are provided via `.provide()` in the React provider
- Export the machine type for use in selectors
- Use nexted states for complex flows with sub-steps
- Define fully-typed context with JSDoc comments and an initial state
- Define events as tagged union types with kebab-case type names
- When implementing actions, actors or guards, create a factory function that receives dependencies and returns the actual implementations
- Selector must operate on machine snapshot (e.g. `type MachineSnapshot = StateFrom<MyMachine>`)
- Handle failures with typed failures and a mapping function
- Use tags for state classification (e.g. `Loading`, `Processing`)
- Use already definted Tags if possibile
- Use absolute state IDs for cross-hierarchy transitions (e.g. `#myMachine.Failure`)

## Reference Examples

- [itwCredentialIssuanceMachine](../../ts/features/itwallet/machine/credential/) - Credential issuance with nested states
- [itwEidIssuanceMachine](../../ts/features/itwallet/machine/eid/) - Complex flow with child machines
- [itwPresentationRemoteMachine](../../ts/features/itwallet/machine/presentation/remote/) - Remote presentation flow
