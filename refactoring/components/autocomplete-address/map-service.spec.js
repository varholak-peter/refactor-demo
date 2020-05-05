import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import sinon from 'sinon';

import MapService, { defaultOptions } from './map-service';

jest.mock('axios');

describe('MapService', () => {
  let instance;
  let mapModuleMock;

  beforeAll(() => {
    mapModuleMock = {
      formatSearchResult: jest.fn(x => x),
      getSuggestionLabel: jest.fn(x => x.kobzol),
      search: jest.fn(),
    };
  });

  beforeEach(() => {
    instance = new MapService(mapModuleMock);
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Instantiates', () => {
      expect(instance).toBeDefined();
      expect(instance.mapModule).toEqual(mapModuleMock);
    });

    it('Instantiates with default options', () => {
      expect(instance.options).toEqual(expect.objectContaining(defaultOptions));
    });

    it('Instantiates with custom options', () => {
      const customOptions = {
        searchDebounce: 100,
        searchThreshold: 5,
      };
      instance = new MapService(mapModuleMock, customOptions);
      expect(instance.options).toEqual(expect.objectContaining(customOptions));
    });

    it('Throws when no map module is provided', () => {
      const instanceCreator = () => new MapService();
      const expected = Error('MapService(constructor): Map module must be provided.');

      expect(instanceCreator).toThrow(expected);
    });
  });

  describe('Search', () => {
    it('Returns empty array for input bellow threshold', async () => {
      const text = 'abc';
      const expected = [];

      const actual = await instance.search(text);

      expect(actual).toEqual(expected);
      expect(axios.get).toHaveBeenCalledTimes(0);
    });

    it('Returns empty array for input shorter than threshold', async () => {
      const text = '';
      const expected = [];

      const actual = await instance.search(text);

      expect(actual).toEqual(expected);
      expect(axios.get).toHaveBeenCalledTimes(0);
    });

    it('Returns empty array for unsuccessful searches', async () => {
      mapModuleMock.search.mockImplementationOnce(() => Promise.reject());
      const text = 'kobzol';
      const expected = [];

      const actual = await instance.search(text);

      expect(actual).toEqual(expected);
      expect(mapModuleMock.search).toHaveBeenCalledTimes(1);
    });

    it('Debounces searches', () => {
      mapModuleMock.search.mockImplementationOnce(x => Promise.resolve(x));
      const clock = sinon.useFakeTimers();

      instance.search('aaaa');
      instance.search('bbbb');
      instance.search('cccc');
      instance.search('dddd');

      expect(mapModuleMock.search).toHaveBeenCalledTimes(0);

      clock.tick(499);

      expect(mapModuleMock.search).toHaveBeenCalledTimes(0);

      clock.tick(1);

      expect(mapModuleMock.search).toHaveBeenCalledTimes(1);
      expect(mapModuleMock.search).toHaveBeenCalledWith('dddd');
    });
  });

  describe('Data formatting', () => {
    it('Gets suggestion label', () => {
      const suggestion = {
        kobzol: '1',
      };
      const expected = '1';

      const actual = instance.getSuggestionLabel(suggestion);

      expect(actual).toEqual(expected);
    });
  });
});
