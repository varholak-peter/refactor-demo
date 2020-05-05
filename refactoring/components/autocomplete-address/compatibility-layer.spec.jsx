import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import sinon from "sinon";

import "./map-modules/google-maps";
import CompatibilityLayer from "./compatibility-layer";

const mockFormatSearchResult = jest.fn();
const mockGeocode = jest.fn();
const mockGetSuggestionLabel = jest.fn();
const mockSearch = jest.fn();
jest.mock("./map-modules/google-maps", () => {
  global.mockGoogleMapsModule = jest.fn();
  return global.mockGoogleMapsModule.mockImplementation(() => {
    return {
      formatSearchResult: mockFormatSearchResult,
      geocode: mockGeocode,
      getSuggestionLabel: mockGetSuggestionLabel,
      search: mockSearch,
    };
  });
});

const dummySearchResponse = [
  { kobzol: "AAAAabc" },
  { kobzol: "AAAAdef" },
  { kobzol: "BBBBabc" },
  { kobzol: "AAAAghi" },
];
const noop = () => {};

describe("<CompatibilityLayer /> - with mapModule", () => {
  let mapModuleMock;

  beforeAll(() => {
    mapModuleMock = {
      formatSearchResult: jest.fn((x) => x),
      getSuggestionLabel: jest.fn((x) => x.kobzol),
      search: jest.fn(() => Promise.resolve(dummySearchResponse)),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("works as TextInput component", () => {
    it("should render", () => {
      render(
        <CompatibilityLayer
          label="Test Input"
          mapModule={mapModuleMock}
          name="test"
          onChange={noop}
          value="o"
        />
      );

      expect(screen.queryByLabelText("Test Input")).toBeInTheDocument();
    });

    it("should call onChange func on change", () => {
      const onChangeSpy = jest.fn();
      render(
        <CompatibilityLayer
          label="Test Input"
          mapModule={mapModuleMock}
          name="test"
          onChange={onChangeSpy}
          value="o"
        />
      );

      fireEvent.change(screen.getByLabelText("Test Input"), {
        target: { value: "Kobzol" },
      });

      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it("should call onUpdate func on change", () => {
      const onUpdateSpy = jest.fn();
      render(
        <CompatibilityLayer
          label="Test Input"
          mapModule={mapModuleMock}
          name="test"
          onUpdate={onUpdateSpy}
          value="o"
        />
      );

      fireEvent.change(screen.getByLabelText("Test Input"), {
        target: { value: "Kobzol" },
      });

      expect(onUpdateSpy).toHaveBeenCalledTimes(1);
      expect(onUpdateSpy).toHaveBeenCalledWith({
        type: "input_change",
        payload: "Kobzol",
      });
    });
  });

  describe("works as Typeahead component", () => {
    it("renders no suggestions when none are available", () => {
      render(
        <CompatibilityLayer
          label="Test Input"
          mapModule={mapModuleMock}
          name="test"
          onChange={noop}
          value=""
        />
      );

      fireEvent.focus(screen.getByLabelText("Test Input"));

      expect(screen.queryByText("AAAAabc")).toBeNull();
      expect(screen.queryByText("AAAAdef")).toBeNull();
      expect(screen.queryByText("AAAAghi")).toBeNull();
      expect(screen.queryByText("BBBBabc")).toBeNull();
    });

    describe("loads suggestions", () => {
      let clock;
      let wrapper;

      beforeEach(async () => {
        clock = sinon.useFakeTimers();

        wrapper = render(
          <CompatibilityLayer
            label="Test Input"
            mapModule={mapModuleMock}
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.change(screen.getByLabelText("Test Input"), {
            target: { value: "AAAA" },
          });
        });

        await act(async () => {
          clock.tick(500);
        });
      });

      it("renders suggestions when available", () => {
        expect(screen.queryByText("AAAAabc")).toBeVisible();
        expect(screen.queryByText("AAAAdef")).toBeVisible();
        expect(screen.queryByText("AAAAghi")).toBeVisible();
        expect(screen.queryByText("BBBBabc")).toBeNull();
      });

      it("renders suggestions based on focus", async () => {
        fireEvent.blur(screen.getByLabelText("Test Input"));

        await act(async () => {
          clock.tick(200);
        });

        expect(screen.queryByText("AAAAabc")).toBeNull();
        expect(screen.queryByText("AAAAdef")).toBeNull();
        expect(screen.queryByText("AAAAghi")).toBeNull();
        expect(screen.queryByText("BBBBabc")).toBeNull();

        fireEvent.focus(screen.getByLabelText("Test Input"));

        expect(screen.queryByText("AAAAabc")).toBeVisible();
        expect(screen.queryByText("AAAAdef")).toBeVisible();
        expect(screen.queryByText("AAAAghi")).toBeVisible();
        expect(screen.queryByText("BBBBabc")).toBeNull();
      });

      it("renders no suggestions when none fit the value", () => {
        const nonPresentValue = "NOT_PRESENT";
        wrapper.rerender(
          <CompatibilityLayer
            label="Test Input"
            mapModule={mapModuleMock}
            name="test"
            onChange={noop}
            value={nonPresentValue}
          />
        );

        expect(screen.queryByText("AAAAabc")).toBeNull();
        expect(screen.queryByText("AAAAdef")).toBeNull();
        expect(screen.queryByText("AAAAghi")).toBeNull();
        expect(screen.queryByText("BBBBabc")).toBeNull();
      });

      it("should call handleSuggestionSelection func on select", async () => {
        const handleSuggestionSelectionSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            handleSuggestionSelection={handleSuggestionSelectionSpy}
            label="Test Input"
            mapModule={mapModuleMock}
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.click(screen.getByText("AAAAabc"));
        });

        expect(handleSuggestionSelectionSpy).toHaveBeenCalledTimes(1);
        expect(handleSuggestionSelectionSpy).toHaveBeenCalledWith({
          kobzol: "AAAAabc",
        });
      });

      it("should call callbackOnFetch func on fetch", async () => {
        const callbackOnFetchSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            callbackOnFetch={callbackOnFetchSpy}
            label="Test Input"
            mapModule={mapModuleMock}
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.change(screen.getByLabelText("Test Input"), {
            target: { value: "AAAA" },
          });
        });

        await act(async () => {
          clock.tick(500);
        });

        expect(callbackOnFetchSpy).toHaveBeenCalledTimes(1);
        expect(callbackOnFetchSpy).toHaveBeenCalledWith(dummySearchResponse);
      });

      it("should call onUpdate func on fetch", async () => {
        const onUpdateSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            label="Test Input"
            mapModule={mapModuleMock}
            name="test"
            onChange={noop}
            onUpdate={onUpdateSpy}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.change(screen.getByLabelText("Test Input"), {
            target: { value: "AAAA" },
          });
        });

        await act(async () => {
          clock.tick(500);
        });

        expect(onUpdateSpy).toHaveBeenCalledTimes(2);
        expect(onUpdateSpy).toHaveBeenCalledWith({
          type: "suggestions_change",
          payload: dummySearchResponse,
        });
      });

      it("should call onUpdate func on select", async () => {
        const onUpdateSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            label="Test Input"
            mapModule={mapModuleMock}
            name="test"
            onChange={noop}
            onUpdate={onUpdateSpy}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.click(screen.getByText("AAAAabc"));
        });

        expect(onUpdateSpy).toHaveBeenCalledTimes(1);
        expect(onUpdateSpy).toHaveBeenCalledWith({
          type: "suggestions_select",
          payload: { kobzol: "AAAAabc" },
        });
      });
    });
  });

  describe("can be configured", () => {
    it("can change debounce rate", async () => {
      const clock = sinon.useFakeTimers();

      render(
        <CompatibilityLayer
          label="Test Input"
          mapModule={mapModuleMock}
          mapServiceOptions={{
            searchDebounce: 200,
          }}
          name="test"
          onChange={noop}
          value="AAA"
        />
      );

      await act(async () => {
        await fireEvent.change(screen.getByLabelText("Test Input"), {
          target: { value: "AAAA" },
        });
      });

      await act(async () => {
        clock.tick(200);
      });

      expect(screen.queryByText("AAAAabc")).toBeVisible();
      expect(screen.queryByText("AAAAdef")).toBeVisible();
      expect(screen.queryByText("AAAAghi")).toBeVisible();
      expect(screen.queryByText("BBBBabc")).toBeNull();
    });

    it("can change search threshold", async () => {
      const clock = sinon.useFakeTimers();

      render(
        <CompatibilityLayer
          label="Test Input"
          mapModule={mapModuleMock}
          mapServiceOptions={{
            searchThreshold: 2,
          }}
          name="test"
          onChange={noop}
          value="A"
        />
      );

      await act(async () => {
        await fireEvent.change(screen.getByLabelText("Test Input"), {
          target: { value: "AA" },
        });
      });

      await act(async () => {
        clock.tick(500);
      });

      expect(screen.queryByText("AAAAabc")).toBeVisible();
      expect(screen.queryByText("AAAAdef")).toBeVisible();
      expect(screen.queryByText("AAAAghi")).toBeVisible();
      expect(screen.queryByText("BBBBabc")).toBeNull();
    });
  });
});

describe("<CompatibilityLayer /> - with googleMapsApiKey", () => {
  jest.spyOn(global.console, "warn").mockImplementation(() => {});

  const dummyGoogleApiKey = "api_key";
  const dummyGeocodedParts = {
    foo: "Kobzol1",
    bar: "Kobzol2",
    baz: "Kobzol3",
  };
  const { mockGoogleMapsModule } = global;

  beforeAll(() => {
    mockFormatSearchResult.mockImplementation((x) => x);
    mockGeocode.mockImplementation(() => Promise.resolve(dummyGeocodedParts));
    mockGetSuggestionLabel.mockImplementation((x) => x.kobzol);
    mockSearch.mockImplementation(() => Promise.resolve(dummySearchResponse));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("works as TextInput component", () => {
    it("should render", () => {
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onChange={noop}
          value="o"
        />
      );

      expect(screen.queryByLabelText("Test Input")).toBeInTheDocument();
    });

    it("should call onChange func on change", () => {
      const onChangeSpy = jest.fn();
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onChange={onChangeSpy}
          value="o"
        />
      );

      fireEvent.change(screen.getByLabelText("Test Input"), {
        target: { value: "Kobzol" },
      });

      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it("should call onUpdate func on change", () => {
      const onUpdateSpy = jest.fn();
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onUpdate={onUpdateSpy}
          value="o"
        />
      );

      fireEvent.change(screen.getByLabelText("Test Input"), {
        target: { value: "Kobzol" },
      });

      expect(onUpdateSpy).toHaveBeenCalledTimes(1);
      expect(onUpdateSpy).toHaveBeenCalledWith({
        type: "input_change",
        payload: "Kobzol",
      });
    });
  });

  describe("works as Typeahead component", () => {
    it("renders no suggestions when none are available", () => {
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onChange={noop}
          value=""
        />
      );

      fireEvent.focus(screen.getByLabelText("Test Input"));

      expect(screen.queryByText("AAAAabc")).toBeNull();
      expect(screen.queryByText("AAAAdef")).toBeNull();
      expect(screen.queryByText("AAAAghi")).toBeNull();
      expect(screen.queryByText("BBBBabc")).toBeNull();
    });

    describe("loads suggestions", () => {
      let clock;
      let wrapper;

      beforeEach(async () => {
        clock = sinon.useFakeTimers();

        wrapper = render(
          <CompatibilityLayer
            googleMapsApiKey={dummyGoogleApiKey}
            label="Test Input"
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.change(screen.getByLabelText("Test Input"), {
            target: { value: "AAAA" },
          });
        });

        await act(async () => {
          clock.tick(500);
        });
      });

      it("renders suggestions when available", () => {
        expect(screen.queryByText("AAAAabc")).toBeVisible();
        expect(screen.queryByText("AAAAdef")).toBeVisible();
        expect(screen.queryByText("AAAAghi")).toBeVisible();
        expect(screen.queryByText("BBBBabc")).toBeNull();
      });

      it("renders suggestions based on focus", async () => {
        fireEvent.blur(screen.getByLabelText("Test Input"));

        await act(async () => {
          clock.tick(200);
        });

        expect(screen.queryByText("AAAAabc")).toBeNull();
        expect(screen.queryByText("AAAAdef")).toBeNull();
        expect(screen.queryByText("AAAAghi")).toBeNull();
        expect(screen.queryByText("BBBBabc")).toBeNull();

        fireEvent.focus(screen.getByLabelText("Test Input"));

        expect(screen.queryByText("AAAAabc")).toBeVisible();
        expect(screen.queryByText("AAAAdef")).toBeVisible();
        expect(screen.queryByText("AAAAghi")).toBeVisible();
        expect(screen.queryByText("BBBBabc")).toBeNull();
      });

      it("renders no suggestions when none fit the value", () => {
        const nonPresentValue = "NOT_PRESENT";
        wrapper.rerender(
          <CompatibilityLayer
            googleMapsApiKey={dummyGoogleApiKey}
            label="Test Input"
            name="test"
            onChange={noop}
            value={nonPresentValue}
          />
        );

        expect(screen.queryByText("AAAAabc")).toBeNull();
        expect(screen.queryByText("AAAAdef")).toBeNull();
        expect(screen.queryByText("AAAAghi")).toBeNull();
        expect(screen.queryByText("BBBBabc")).toBeNull();
      });

      it("should call handleSuggestionSelection func on select with default filterInput", async () => {
        const handleSuggestionSelectionSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            googleMapsApiKey={dummyGoogleApiKey}
            handleSuggestionSelection={handleSuggestionSelectionSpy}
            label="Test Input"
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.click(screen.getByText("AAAAabc"));
        });

        expect(handleSuggestionSelectionSpy).toHaveBeenCalledTimes(1);
        expect(handleSuggestionSelectionSpy).toHaveBeenCalledWith("AAAAabc");
      });

      it("should call handleSuggestionSelection func on select with filterInput", async () => {
        const filterInputSpy = jest.fn((x) => x);
        const handleSuggestionSelectionSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            filterInput={filterInputSpy}
            googleMapsApiKey={dummyGoogleApiKey}
            handleSuggestionSelection={handleSuggestionSelectionSpy}
            label="Test Input"
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.click(screen.getByText("AAAAabc"));
        });

        expect(filterInputSpy).toHaveBeenCalledTimes(1);
        expect(filterInputSpy).toHaveBeenCalledWith({
          kobzol: "AAAAabc",
          parts: dummyGeocodedParts,
        });
        expect(handleSuggestionSelectionSpy).toHaveBeenCalledTimes(1);
        expect(handleSuggestionSelectionSpy).toHaveBeenCalledWith({
          kobzol: "AAAAabc",
          parts: dummyGeocodedParts,
        });
      });

      it("should call callbackOnFetch func on fetch", async () => {
        const callbackOnFetchSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            callbackOnFetch={callbackOnFetchSpy}
            googleMapsApiKey={dummyGoogleApiKey}
            label="Test Input"
            name="test"
            onChange={noop}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.change(screen.getByLabelText("Test Input"), {
            target: { value: "AAAA" },
          });
        });

        await act(async () => {
          clock.tick(500);
        });

        expect(callbackOnFetchSpy).toHaveBeenCalledTimes(1);
        expect(callbackOnFetchSpy).toHaveBeenCalledWith(dummySearchResponse);
      });

      it("should call onUpdate func on fetch", async () => {
        const onUpdateSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            googleMapsApiKey={dummyGoogleApiKey}
            label="Test Input"
            name="test"
            onChange={noop}
            onUpdate={onUpdateSpy}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.change(screen.getByLabelText("Test Input"), {
            target: { value: "AAAA" },
          });
        });

        await act(async () => {
          clock.tick(500);
        });

        expect(onUpdateSpy).toHaveBeenCalledTimes(2);
        expect(onUpdateSpy).toHaveBeenCalledWith({
          type: "suggestions_change",
          payload: dummySearchResponse,
        });
      });

      it("should call onUpdate func on select", async () => {
        const onUpdateSpy = jest.fn();
        wrapper.rerender(
          <CompatibilityLayer
            googleMapsApiKey={dummyGoogleApiKey}
            label="Test Input"
            name="test"
            onChange={noop}
            onUpdate={onUpdateSpy}
            value="AAA"
          />
        );

        await act(async () => {
          await fireEvent.click(screen.getByText("AAAAabc"));
        });

        expect(onUpdateSpy).toHaveBeenCalledTimes(1);
        expect(onUpdateSpy).toHaveBeenCalledWith({
          type: "suggestions_select",
          payload: { kobzol: "AAAAabc" },
        });
      });
    });
  });

  describe("can be configured", () => {
    it("can change debounce rate", async () => {
      const clock = sinon.useFakeTimers();

      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          mapServiceOptions={{
            searchDebounce: 200,
          }}
          name="test"
          onChange={noop}
          value="AAA"
        />
      );

      await act(async () => {
        await fireEvent.change(screen.getByLabelText("Test Input"), {
          target: { value: "AAAA" },
        });
      });

      await act(async () => {
        clock.tick(200);
      });

      expect(screen.queryByText("AAAAabc")).toBeVisible();
      expect(screen.queryByText("AAAAdef")).toBeVisible();
      expect(screen.queryByText("AAAAghi")).toBeVisible();
      expect(screen.queryByText("BBBBabc")).toBeNull();
    });

    it("can change search threshold", async () => {
      const clock = sinon.useFakeTimers();

      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          mapServiceOptions={{
            searchThreshold: 2,
          }}
          name="test"
          onChange={noop}
          value="A"
        />
      );

      await act(async () => {
        await fireEvent.change(screen.getByLabelText("Test Input"), {
          target: { value: "AA" },
        });
      });

      await act(async () => {
        clock.tick(500);
      });

      expect(screen.queryByText("AAAAabc")).toBeVisible();
      expect(screen.queryByText("AAAAdef")).toBeVisible();
      expect(screen.queryByText("AAAAghi")).toBeVisible();
      expect(screen.queryByText("BBBBabc")).toBeNull();
    });

    it("can change placeFields as object", () => {
      const placeFields = {
        foo: "Kobzol1",
        bar: "Kobzol2",
      };
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onChange={noop}
          placeFields={placeFields}
          value="A"
        />
      );

      expect(mockGoogleMapsModule).toHaveBeenCalledTimes(1);
      expect(mockGoogleMapsModule).toHaveBeenCalledWith(dummyGoogleApiKey, {
        placeFields,
      });
    });

    it("can change placeFields as array", () => {
      const placeFieldsArray = [
        ["foo", "Kobzol1"],
        ["bar", "Kobzol2"],
      ];
      const placeFields = {
        foo: "Kobzol1",
        bar: "Kobzol2",
      };
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onChange={noop}
          placeFields={placeFieldsArray}
          value="A"
        />
      );

      expect(mockGoogleMapsModule).toHaveBeenCalledTimes(1);
      expect(mockGoogleMapsModule).toHaveBeenCalledWith(dummyGoogleApiKey, {
        placeFields,
      });
    });

    it("can change searchOptions", () => {
      const searchOptions = {
        foo: "Kobzol1",
        bar: "Kobzol2",
      };
      render(
        <CompatibilityLayer
          googleMapsApiKey={dummyGoogleApiKey}
          label="Test Input"
          name="test"
          onChange={noop}
          searchOptions={searchOptions}
          value="A"
        />
      );

      expect(mockGoogleMapsModule).toHaveBeenCalledTimes(1);
      expect(mockGoogleMapsModule).toHaveBeenCalledWith(dummyGoogleApiKey, {
        searchOptions,
      });
    });
  });
});

describe("<CompatibilityLayer /> - deprecation", () => {
  const consoleSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation(() => {});

  const dummyGoogleApiKey = "api_key";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Prop warnings", () => {
    it("warns about deprecated props", () => {
      render(
        <CompatibilityLayer
          callbackOnFetch={noop}
          filterInput={noop}
          googleMapsApiKey={dummyGoogleApiKey}
          handleSuggestionSelection={noop}
          label="Test Input"
          name="test"
          onChange={noop}
          placeFields={{}}
          searchOptions={{}}
          value="o"
        />
      );

      expect(consoleSpy).toHaveBeenCalledTimes(6);
      expect(consoleSpy.mock.calls[0][0]).toEqual(
        '[Deprecation] AutocompleteAddress: Property "callbackOnFetch" is deprecated, please use "onUpdate" instead.'
      );
      expect(consoleSpy.mock.calls[1][0]).toEqual(
        '[Deprecation] AutocompleteAddress: Property "filterInput" is deprecated.'
      );
      expect(consoleSpy.mock.calls[2][0]).toEqual(
        '[Deprecation] AutocompleteAddress: Property "googleMapsApiKey" is deprecated, please use "mapModule" instead.'
      );
      expect(consoleSpy.mock.calls[3][0]).toEqual(
        '[Deprecation] AutocompleteAddress: Property "handleSuggestionSelection" is deprecated, please use "onUpdate" instead.'
      );
      expect(consoleSpy.mock.calls[4][0]).toEqual(
        '[Deprecation] AutocompleteAddress: Property "placeFields" is deprecated, please use "mapModule" instead.'
      );
      expect(consoleSpy.mock.calls[5][0]).toEqual(
        '[Deprecation] AutocompleteAddress: Property "searchOptions" is deprecated, please use "mapModule" instead.'
      );
    });
  });
});
