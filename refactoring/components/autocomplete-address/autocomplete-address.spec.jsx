import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import sinon from "sinon";

import AutocompleteAddress from "./AutocompleteAddress";

const dummySearchResponse = [
  { kobzol: "AAAAabc" },
  { kobzol: "AAAAdef" },
  { kobzol: "BBBBabc" },
  { kobzol: "AAAAghi" },
];
const noop = () => {};

describe("<AutocompleteAddress />", () => {
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
        <AutocompleteAddress
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
        <AutocompleteAddress
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
        <AutocompleteAddress
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
        <AutocompleteAddress
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
          <AutocompleteAddress
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
          <AutocompleteAddress
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
          <AutocompleteAddress
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
          <AutocompleteAddress
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
          <AutocompleteAddress
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
          <AutocompleteAddress
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
        <AutocompleteAddress
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
        <AutocompleteAddress
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
