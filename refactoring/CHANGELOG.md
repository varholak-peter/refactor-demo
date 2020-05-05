# Refactoring steps

## Verify existing tests

Make sure the existing tests (if any) can be run and all of them pass, if they are not passing identify the failing tests and skip them for now. Do **not** make any chnages to the code at this point.

## Add new tests for coverage

It is important to create a "snapshot" of the current functionality, as such we start investigating the code and create tests that validate the output of different functions.

**Note:** We may find out there are bugs in the code and may be tempted to write tests which check the proper output and then fix the code. **DON'T** do this, at this point we need to make sure we can maintain the existing functionality and this could introduce some regression bugs.

In order to create an output snapshot we can simply assert the actual value against an empty object and once the test runner complains that it received a different object we simply use that as an expected output.

## Update tests

This is the moment when we un-skip any tests from the first step and fix them so they pass.

At this point we can upgrade any testing tools we currently have and or introduce new tools we plan to use.

At the end of this step we will have an upgraded test suite that will serve as a validator for every single step forwards.

## Start decoupling (Google Maps)

We need to start extracting the functionality relevant to Google Maps into a separate module by following a [TDD](https://en.wikipedia.org/wiki/Test-driven_development) approach.

Right now we are not replacing the current implementation in `index.js` but instead work in a separate file in `map-modules/google-maps.js`.

We investigate what is needed for the component to function properly and design the API as such, while taking into consideration that Mapbox module will follow a similar API.

Given the current implementation, we see that an `access token` is required and we are able to provide custom options to the functionality.

Our primary use case is the ability to `search` and afterwards the chosen suggestion is `geocoded`.

There is also some behavior that is native to Google Maps and cannot be easily reused, so we decouple it into utility functions. (e.g. formatting the API response or getting lables for `Typeahead`)

Our final shape therefore looks like this:

```js
class GoogleMapsModule {
  constructor(accessToken, options) {}

  static formatSearchResult(searchResult) {}

  static getGoogleMapsApiUrl(key) {}

  static getSuggestionLabel(suggestion) {}

  privateFormatAddressComponents(addressComponents) {}

  async privateGeocodeRequest(placeId) {}

  privateInitAutocomplete() {}

  async privateSearchRequest(text) {}

  formatSearchResult = GoogleMapsModule.formatSearchResult;

  getSuggestionLabel = GoogleMapsModule.getSuggestionLabel;

  async geocode(placeId, applyAddressComponentsFormatting = true) {}

  async search(text) {}
}
```

**Note:** We prefix the private method with `private` here but this is not required. We could use a symbol such as `$` or `_` to convey that the method is private but ultimately nothing stops us from using them as if they are public due to JavaScript implementation of classes.

## Implement new (Mapbox)

We can now start implementing the Mapbox service akin to Google Maps.

One obstacle we need to overcome is the fact that both services have different result shape. Which gives us two options:

- Create a normalizer that standarizes the responses into a common shape
- Give module ownership to the consumer, which they can then utilize to manipulate the result

We opt in for the latter option as Google Maps & Mapbox don't have sufficient overlap for our use case and we want to give the consumer the control over data they consume.

It also allows us to future-proof this better as a different service added in the future may not have an overlap with the normalized response.
