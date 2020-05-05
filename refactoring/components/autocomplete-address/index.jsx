// TODO: Replace compatibility layer with following import once ready for BREAKING CHANGE
// import AutocompleteAddress from './AutocompleteAddress';
import AutocompleteAddress from "./compatibility-layer";
import GoogleMapsModule from "./map-modules/google-maps";
import MapboxModule from "./map-modules/mapbox";

AutocompleteAddress.modules = { GoogleMapsModule, MapboxModule };

export default AutocompleteAddress;
