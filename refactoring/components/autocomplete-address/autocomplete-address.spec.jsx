import React from "react";
import { mount } from "enzyme";
import { fireEvent, render, screen } from "@testing-library/react";
import AutocompleteAddress from "./index";

const dummySuggestions = [
  { description: "AAAAabc" },
  { description: "AAAAdef" },
  { description: "BBBBabc" },
  { description: "AAAAghi" },
];
const noop = () => {};

describe("<AutocompleteAddress />", () => {
  describe("works as TextInput component", () => {
    it("should render", () => {
      render(
        <AutocompleteAddress
          googleMapsApiKey=""
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
        <AutocompleteAddress
          googleMapsApiKey=""
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
  });

  describe("works as Typeahead component", () => {
    const testValue = "AAA";
    const changeFunc = jest.fn();

    it("should render an <Typeahead", () => {
      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={changeFunc}
          value={testValue}
        />
      );
      wrapper.setState({ googleMapsApiReady: true });
      expect(wrapper.find("Typeahead").exists()).toBe(true);
      wrapper.unmount();
    });

    it("renders no suggestions when none are available", () => {
      render(
        <AutocompleteAddress
          googleMapsApiKey=""
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

    it("should call handleSuggestionSelection func on select", () => {
      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={changeFunc}
          value={"A"}
        />
      );
      wrapper.setState({
        suggestions: dummySuggestions,
        googleMapsApiReady: true,
      });
      wrapper.find("input").simulate("keydown", {
        keyCode: 40,
        which: 40,
        code: "ArrowDown",
        key: "ArrowDown",
      });
      wrapper.find("input").simulate("focus");
      expect(wrapper.find("ul").exists()).toBe(true);
      expect(wrapper.find("li").length).toBe(3);
      wrapper.unmount();
    });

    it("should call onChange callback with a SyntheticEvent", () => {
      const customOnChange = jest.fn((e) => {
        expect(e.constructor.name).toBe("SyntheticEvent");
        expect(e.target.name).toBe("test");
        expect(e.target.value).toBe("New York |@#|¢|@#");
        expect(e.target.validity.patternMismatch).toBe(true);
      });
      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={customOnChange}
          pattern="[0-9]+"
          value={testValue}
        />
      );
      wrapper.find("input").instance().value = "New York |@#|¢|@#";
      wrapper.find("input").simulate("change");
      expect(customOnChange).toHaveBeenCalled();
      wrapper.unmount();
    });
  });
});
