import React from "react";
import AutocompleteSearchBox, {
  ISuggestionItem,
} from "../libs/AutocompleteSearchBox/AutocompleteSearchBox";
import "./SearchBoxDemo.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import HighlightTextView from "../libs/Utils/HighlightTextView";
import { IStackProps, ScrollablePane, Stack } from "@fluentui/react";

const SearchBoxDemo = () => {
  const heroes = [
    "Iron Man",
    "Captain America",
    "Thor",
    "Hulk",
    "Black Widow",
    "Hawkeye",
    "Black Panther",
    "Ant Man",
    "Spiderman",
  ];
  const [suggestions, setSuggestions] = React.useState<string[]>();
  const onChange = (newText?: string) => {
    if (!newText || newText.trim() === "") {
      setSuggestions(undefined);
    } else { 
      setSuggestions(
        heroes.filter((hero) => 
          hero.toLowerCase().includes(newText.toLowerCase())
        )
      );
    }
  };

  const onSuggestionClicked = (suggestion: string | ISuggestionItem) => {
    alert(
      typeof suggestion === "string" ? suggestion : suggestion.getSearchText()
    );
  };

  const queryThreshold = 3;
  const debounceTime = 500;
  const [inProgress, setProgress] = React.useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = React.useState<
    ISuggestionItem[]
  >();

  const filterModifications = (filter: string)=>{
    if (!filter || filter.trim() === "") {
      filter="";
    }
    else {
      const words = filter.split(" ");
      filter = words.map((word) => { 
          return word[0].toUpperCase() + word.substring(1).split("").map(letter=>letter.toLowerCase()).join(""); 
      }).join(" ");
    }
    return filter;
  }

  const getSearchQuery = (filter: string) => `https://services.odata.org/V3/OData/OData.svc/Products?$filter=substringof('${filterModifications(filter)}',Description)`;
  

  class Product implements ISuggestionItem {
    constructor(
      private ID: string,
      private Name: string,
      private Description: string,
      private Price?: number
    ) { }
    getSearchText: () => string = () => {
      return this.Name;
    };
    getSuggestionItem(query?: string) {
      return (
        <div key={this.ID} className="suggestionItem">
          <div className="suggestionTitleRow row">
            <p className="suggestionTitle col-8">
              <HighlightTextView
                text={this.Name}
                filter={query || ""}
              ></HighlightTextView>
            </p>
            <p className="suggestionPrice col-4">${this.Price}</p>
            <div className="col-12 suggestionSubtitle">
              <HighlightTextView
                text={this.Description}
                filter={query || ""}
              ></HighlightTextView>
            </div>
          </div>
        </div>
      );
    }
  }
  const onChangeDynamic = (newText?: string) => {
    if (!newText || newText.trim().length < queryThreshold) {
      setSuggestions(undefined);
    } else {
      setProgress(true);
      fetch(getSearchQuery(newText), {
        headers: { Accept: "application/json" },
      })
        .then((result) => result.json())
        .then((result) => {
          let products = result.value.map(
            (val: any) =>
              new Product(val.ID, val.Name, val.Description, val.Price)
          );
          console.log(products);
          setDynamicSuggestions(products);
          setProgress(false);
        });
    }
  };

  return (
    <div>
      <div className="search-panel">
        <span>With string suggestions</span>
        <Stack>
          <Stack tokens={{ childrenGap: 12 }}>
            <Stack horizontal verticalAlign="end" horizontalAlign="center">
              <AutocompleteSearchBox
                className="search-box-try"
                onSuggestionClicked={onSuggestionClicked}
                onChange={(_, newValue) => {
                  onChange(newValue);
                }}
                suggestions={suggestions}
              ></AutocompleteSearchBox>
            </Stack>
          </Stack>
        </Stack>
      </div>
      <br />
      <br />
      <div className="search-panel">
        <span>With custom layout suggestions</span>
        <AutocompleteSearchBox
          className="search-box"
          onSuggestionClicked={onSuggestionClicked}
          onChange={(_, newValue) => {
            onChangeDynamic(newValue);
          }}
          suggestions={dynamicSuggestions}
          inProgress={inProgress}
          debounceTime={debounceTime}
        ></AutocompleteSearchBox>
      </div>
    </div>
  );
};

export default SearchBoxDemo;
