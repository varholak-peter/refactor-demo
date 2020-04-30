import React from "react";
import { mount, shallow } from "enzyme";
import AutocompleteAddress from "./index";

describe("<AutocompleteAddress />", () => {
  describe("works as TextInput component", () => {
    const noop = () => {};

    it("should render consistently", () => {
      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={noop}
          value="o"
        />
      );
      expect(wrapper).toBeTruthy();
      wrapper.unmount();
    });

    it("should render an <TestInput", () => {
      const wrapper = shallow(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={noop}
          value="o"
        />
      );
      expect(wrapper.find("TextInput").exists()).toBe(true);
    });

    it("should call handleChange func on change", () => {
      const changeFunc = jest.fn();

      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={changeFunc}
          value="o"
        />
      );
      wrapper.find("input").simulate("change");
      expect(changeFunc).toHaveBeenCalled();
      wrapper.unmount();
    });

    it("should not render an <Typeahead", () => {
      const wrapper = shallow(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={noop}
          value="o"
        />
      );
      expect(wrapper.find("Typeahead").exists()).toBe(false);
      wrapper.unmount();
    });
  });

  describe("works as Typeahead component", () => {
    const testValue = "o";
    const changeFunc = jest.fn();

    it("should render an <Typeahead", () => {
      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={changeFunc}
          value={testValue.test}
        />
      );
      wrapper.setState({ googleMapsApiReady: true });
      expect(wrapper.find("Typeahead").exists()).toBe(true);
      wrapper.unmount();
    });

    it("should call handleSuggestionSelection func on select", () => {
      const wrapper = mount(
        <AutocompleteAddress
          googleMapsApiKey=""
          label="Test Input"
          name="test"
          onChange={changeFunc}
          value={testValue.test}
        />
      );
      wrapper.setState({
        suggestions: ["1", "2", "3"],
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
          value={testValue.test}
        />
      );
      wrapper.find("input").instance().value = "New York |@#|¢|@#";
      wrapper.find("input").simulate("change");
      expect(customOnChange).toHaveBeenCalled();
      wrapper.unmount();
    });
  });
});
