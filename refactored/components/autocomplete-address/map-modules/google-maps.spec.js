import scriptLoader from '../../../utils/script-loader';

import GoogleMapsModule, { defaultOptions, googleMapsBaseUrl } from './google-maps';

jest.mock('../../../utils/script-loader');

describe('GoogleMapsModule', () => {
  let instance;
  let mockGeocode;
  let mockGetPlacePredictions;

  beforeEach(() => {
    instance = new GoogleMapsModule('Kobzol');
    mockGeocode = jest.fn();
    mockGetPlacePredictions = jest.fn();
    global.google = {
      maps: {
        Geocoder: jest.fn().mockImplementation(() => ({
          geocode: mockGeocode,
        })),
        GeocoderStatus: {
          OK: 'OK',
        },
        places: {
          AutocompleteService: jest.fn().mockImplementation(() => ({
            getPlacePredictions: mockGetPlacePredictions,
          })),
          PlacesServiceStatus: {
            OK: 'OK',
          },
        },
      },
    };
    instance.privateInitAutocomplete();

    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Instantiates', () => {
      expect(instance).toBeDefined();
      expect(instance.accessToken).toEqual('Kobzol');
    });

    it('Instantiates with default options', () => {
      expect(instance.options).toEqual(expect.objectContaining(defaultOptions));
    });

    it('Instantiates with custom options', () => {
      const customOptions = {
        placeFields: {
          foo: 'kobzol',
        },
        searchOptions: {
          bar: 'kobzol',
        },
      };
      instance = new GoogleMapsModule('Kobzol', customOptions);
      expect(instance.options).toEqual(expect.objectContaining(customOptions));
    });

    it('Throws when no access token is provided', () => {
      const instanceCreator = () => new GoogleMapsModule();
      const expected = Error('GoogleMapsModule(constructor): Access token must be provided.');

      expect(instanceCreator).toThrow(expected);
    });

    it('Loads Google Maps script', () => {
      const accessToken = 'Kobzol';
      instance = new GoogleMapsModule(accessToken);
      const expectedScriptObject = {
        id: 'googleMapsApi',
        url: `${googleMapsBaseUrl}?libraries=places&key=${accessToken}`,
      };

      expect(scriptLoader).toHaveBeenCalledTimes(1);
      expect(scriptLoader).toHaveBeenCalledWith([expect.objectContaining(expectedScriptObject)]);
    });

    it('Initializes autocompletion when Google Maps script loads', () => {
      instance.privateInitAutocomplete();

      expect(global.google.maps.Geocoder).toHaveBeenCalledTimes(1);
      expect(global.google.maps.places.AutocompleteService).toHaveBeenCalledTimes(1);
    });

    it("Does not crash when window.google. isn't populated", () => {
      global.google = undefined;

      instance.privateInitAutocomplete();
    });

    it("Does not crash when window.google.maps.places isn't populated", () => {
      global.google.maps.places = undefined;

      instance.privateInitAutocomplete();
    });
  });

  describe('Search', () => {
    it('Throws when input is empty', async () => {
      const text = '';
      const expected = Error(
        `GoogleMapsModule(search): Must provide a non-empty 'text'(string) value, you provided: ""`
      );

      const actual = instance.search(text);

      await expect(actual).rejects.toEqual(expected);
      expect(mockGetPlacePredictions).toHaveBeenCalledTimes(0);
    });

    it('Requests data from Google Maps', async () => {
      const dummyResponse = 'kobzol';
      mockGetPlacePredictions.mockImplementationOnce((whatever, cb) => {
        cb(dummyResponse, 'OK');
      });
      const text = 'abcd';
      const expected = dummyResponse;

      const actual = await instance.search(text);

      expect(actual).toEqual(expected);
      expect(mockGetPlacePredictions).toHaveBeenCalledTimes(1);
      expect(mockGetPlacePredictions.mock.calls[0][0]).toEqual({ input: text });
    });

    it('Requests data from Google Maps with custom search options', async () => {
      instance = new GoogleMapsModule('Kobzol', { searchOptions: { foo: 'Kobzol' } });
      instance.privateInitAutocomplete();

      const dummyResponse = 'kobzol';
      mockGetPlacePredictions.mockImplementationOnce((whatever, cb) => {
        cb(dummyResponse, 'OK');
      });
      const text = 'abcd';
      const expected = dummyResponse;

      const actual = await instance.search(text);

      expect(actual).toEqual(expected);
      expect(mockGetPlacePredictions).toHaveBeenCalledTimes(1);
      expect(mockGetPlacePredictions.mock.calls[0][0]).toEqual({ foo: 'Kobzol', input: text });
    });

    it('Rejects when Google Maps request fails', async () => {
      const dummyStatus = 'NOT_OK';
      mockGetPlacePredictions.mockImplementationOnce((whatever, cb) => {
        cb({}, dummyStatus);
      });
      const text = 'abcd';
      const expected = dummyStatus;

      const actual = instance.search(text);

      await expect(actual).rejects.toEqual(expected);
      expect(mockGetPlacePredictions).toHaveBeenCalledTimes(1);
      expect(mockGetPlacePredictions.mock.calls[0][0]).toEqual({ input: text });
    });
  });

  describe('Geocode', () => {
    it('Requests data from Google Maps', async () => {
      const dummyResponse = 'kobzol';
      mockGeocode.mockImplementationOnce((whatever, cb) => {
        cb(dummyResponse, 'OK');
      });
      const placeId = 'Kobzol';
      const expected = dummyResponse;

      const actual = await instance.geocode(placeId, false);

      expect(actual).toEqual(expected);
      expect(mockGeocode).toHaveBeenCalledTimes(1);
      expect(mockGeocode.mock.calls[0][0]).toEqual({ placeId });
    });

    it('Rejects when Google Maps request fails', async () => {
      const dummyStatus = 'NOT_OK';
      mockGeocode.mockImplementationOnce((whatever, cb) => {
        cb({}, dummyStatus);
      });
      const placeId = 'Kobzol';
      const expected = Error(
        'GoogleMapsModule(geocode): Could not process geocoding request. STATUS: "NOT_OK"\nDocs: https://developers.google.com/maps/documentation/javascript/reference/geocoder#GeocoderStatus'
      );

      const actual = instance.geocode(placeId, false);

      await expect(actual).rejects.toEqual(expected);
      expect(mockGeocode).toHaveBeenCalledTimes(1);
      expect(mockGeocode.mock.calls[0][0]).toEqual({ placeId });
    });

    it('Properly formats Address Components', async () => {
      const dummyResponse = [
        {
          address_components: [
            {
              long_name: 'Kobzol1',
              short_name: 'Kbzl1',
              types: ['foo'],
            },
            {
              long_name: 'Kobzol2',
              short_name: 'Kbzl2',
              types: ['bar'],
            },
          ],
        },
      ];
      mockGeocode.mockImplementationOnce((whatever, cb) => {
        cb(dummyResponse, 'OK');
      });
      const placeId = 'Kobzol';
      const expected = {
        foo: 'Kobzol1',
        bar: 'Kbzl2',
      };
      instance.options.placeFields = {
        foo: 'long_name',
        bar: 'short_name',
      };

      const actual = await instance.geocode(placeId);

      expect(actual).toEqual(expected);
      expect(mockGeocode).toHaveBeenCalledTimes(1);
      expect(mockGeocode.mock.calls[0][0]).toEqual({ placeId });
    });
  });

  describe('Data formatting', () => {
    it('Formats search result', () => {
      const resultData = [
        {
          description: '1',
        },
        {
          description: '2',
        },
        {
          description: '3',
        },
        {
          description: '4',
        },
      ];
      const expected = resultData;

      const actualStatic = GoogleMapsModule.formatSearchResult(resultData);
      const actualInstance = instance.formatSearchResult(resultData);

      expect(actualStatic).toEqual(expected);
      expect(actualInstance).toEqual(expected);
    });

    it('Gets suggestion label', () => {
      const suggestion = {
        description: '1',
        foo: 'bar',
        kobzol: 'kobzol',
      };
      const expected = '1';

      const actualStatic = GoogleMapsModule.getSuggestionLabel(suggestion);
      const actualInstance = instance.getSuggestionLabel(suggestion);

      expect(actualStatic).toEqual(expected);
      expect(actualInstance).toEqual(expected);
    });
  });
});
