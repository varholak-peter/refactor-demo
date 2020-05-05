import axios from 'axios';

import MapboxModule, { defaultOptions, mapboxBaseUrl } from './mapbox';

jest.mock('axios');

describe('MapboxModule', () => {
  let instance;

  beforeEach(() => {
    instance = new MapboxModule('Kobzol');
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
        autocomplete: false,
        endpoint: 'endpoint',
        fuzzyMatch: true,
        limit: 10,
      };
      instance = new MapboxModule('Kobzol', customOptions);
      expect(instance.options).toEqual(expect.objectContaining(customOptions));
    });

    it('Throws when no access token is provided', () => {
      const instanceCreator = () => new MapboxModule();
      const expected = Error('MapboxModule(constructor): Access token must be provided.');

      expect(instanceCreator).toThrow(expected);
    });
  });

  describe('Search', () => {
    it('Throws when input is empty', async () => {
      const text = '';
      const expected = Error(
        `MapboxModule(search): Must provide a non-empty 'text'(string) value, you provided: ""`
      );

      const actual = instance.search(text);

      await expect(actual).rejects.toEqual(expected);
      expect(axios.get).toHaveBeenCalledTimes(0);
    });

    it('Requests data from Mapbox', async () => {
      const dummyResponse = { data: 'kobzol' };
      axios.get.mockImplementationOnce(() => Promise.resolve(dummyResponse));
      const text = 'abcd';
      const expected = 'kobzol';

      const actual = await instance.search(text);

      expect(actual).toEqual(expected);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `/geocoding/v5/${defaultOptions.endpoint}/${text}.json`,
        {
          baseURL: mapboxBaseUrl,
          params: {
            access_token: 'Kobzol',
            autocomplete: true,
            fuzzyMatch: false,
            limit: 5,
          },
        }
      );
    });
  });

  describe('Data formatting', () => {
    it('Formats search result', () => {
      const resultData = {
        features: [
          {
            place_name: '1',
          },
          {
            place_name: '2',
          },
          {
            place_name: '3',
          },
          {
            place_name: '4',
          },
        ],
      };
      const expected = resultData.features;

      const actualStatic = MapboxModule.formatSearchResult(resultData);
      const actualInstance = instance.formatSearchResult(resultData);

      expect(actualStatic).toEqual(expected);
      expect(actualInstance).toEqual(expected);
    });

    it('Gets suggestion label', () => {
      const suggestion = {
        place_name: '1',
        foo: 'bar',
        kobzol: 'kobzol',
      };
      const expected = '1';

      const actualStatic = MapboxModule.getSuggestionLabel(suggestion);
      const actualInstance = instance.getSuggestionLabel(suggestion);

      expect(actualStatic).toEqual(expected);
      expect(actualInstance).toEqual(expected);
    });
  });
});
