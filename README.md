# Refactor Demo

[//]: # "Badge zone"
[//]: # "Short description to introduce the project"

This should serve as a how to guide on refactoring legacy code into its modern counterpart.

[//]: # "If this is a consumable module, template or library; add major version notes here so other developers know if this is compatible with their use case"

**Note:** This demo uses [React](https://reactjs.org/).

## Task specification

Change `<AutocompleteAddress />` map service from [Google Maps](https://developers.google.com/maps/documentation/javascript/geocoding) to [Mapbox](https://docs.mapbox.com/api/search/) while maintaining backwards compatibility.

**GIVEN:** I am a developer.

**WHEN:** I want to use the `<AutocompleteAddress />` component.

**THEN:** I am able to use the Mapbox API.

---

**GIVEN:** I am a developer.

**WHEN:** I am using `<AutocompleteAddress />` component in a legacy app.

**THEN:** Nothing breaks once I update the component library.

## How this repository works

This repository is split into 4 folders: `legacy`, `refactored`, `refactoring` and `shared`.

### Legacy

Legacy folder represents the starting state of the codebase for reference.

This is a minimal representation of the `src` folder in a component library.

### Refactored

Refactored folder represents the final state of the codebase for reference.

This is a minimal representation of the `src` folder in a component library.

### Refactoring

Refactoring folder represents the step by step process of refactoring according to [task specification](#Task-specification).

This is a minimal representation of the `src` folder in a component library.

### Shared

Shared folder contains dummy mocks of dependencies, which the rest of the codebase uses.

[//]: # "List of prerequisites"

## Prerequisites

- [Node.JS](https://nodejs.org/) (Recommended using v10 or higher)
- [Yarn](https://yarnpkg.com/)

[//]: # "Recommended getting started flow should come first and be marked as recommended"

## Getting Started

Run the following script:

```
git clone https://github.com/varholak-peter/refactor-demo.git
```

Once you clone the repository run the following command to verify the installation:

```
cd refactor-demo
yarn && yarn test
```

[//]: # "Useful commands"

## Useful commands

#### `yarn test`

Runs all tests.

#### `yarn test:legacy`

Runs legacy test suite.

#### `yarn test:refactored`

Runs refactored test suite.

#### `yarn test:refactoring`

Runs refactoring test suite.

[//]: # "Describe possible obstacles that users can run into when running the project"

## CONTRIBUTING

Contributions are always welcome, no matter how large or small. Before contributing,
please read the [code of conduct](CODE_OF_CONDUCT.md).
