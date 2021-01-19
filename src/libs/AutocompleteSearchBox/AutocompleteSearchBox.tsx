import {
  Callout,
  DefaultEffects,
  DirectionalHint,
  FocusZone,
  ICalloutContentStyles,
  IProgressIndicatorStyles,
  ISearchBoxProps,
  ProgressIndicator,
  SearchBox,
  IFocusZone,
  FocusZoneDirection,
  FocusZoneTabbableElements,
  Link,
  KeyCodes,
} from "@fluentui/react";
import React from "react";
import { RenderIf } from "..";

export interface ISuggestionItem {
  getSuggestionItem: () => JSX.Element;
  getSearchText: () => string;
}

interface IAutocompleteSearchBoxProps extends ISearchBoxProps {
  suggestions?: string[] | ISuggestionItem[];
  onSuggestionClicked: (suggestion: string | ISuggestionItem) => void;
  inProgress?: boolean;
}
const AutocompleteSearchBox = (props: IAutocompleteSearchBoxProps) => {
  const textInput = React.useRef<HTMLDivElement>(null);
  const [isCalloutFocussed, setCalloutFocussed] = React.useState(false);
  const [isCallOutVisible, setIsCallOutVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const focusZoneRef = React.useRef<IFocusZone>(null);
  const [suggestions, setSuggestions] = React.useState<
    string[] | ISuggestionItem[]
  >();

  React.useEffect(() => {
    setSuggestions(props.suggestions);
    setIsCallOutVisible(props.suggestions !== undefined);
  }, [props.suggestions]);

  React.useEffect(() => {
    setIsLoading(props.inProgress === true ? true : false);
  }, [props.inProgress]);

  const ProgressIndicatorStyle: Partial<IProgressIndicatorStyles> = {
    itemProgress: {
      paddingBottom: "4px",
    },
  };
  const typeAheadCalloutStyle: Partial<ICalloutContentStyles> = {
    root: {
      boxShadow: DefaultEffects.elevation4,
      borderRadius: 2,
      marginTop: 0,
      maxWidth: 800,
      width: "100%",
      minWidth: "250px",
      overflow: "hidden",
      //maxHeight: '500px!important'
      top: "0px!important",
      left: "0px",
      selectors: {
        "@media(max-width: 600px)": {
          top: "0px",
          left: "0px",
          bottom: "-200px!important",
          minWidth: "250px",
        },
      },
    },
    container: {
      zIndex: 3,
      position: "relative",
    },
    calloutMain: {
      minHeight: "fit-content",
      maxHeight: "500px!important",
      height: "100%",
    },
  };
  const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsCallOutVisible(suggestions !== undefined && suggestions.length > 0);

    if (props.onFocus) props.onFocus(event);
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    switch (ev.which) {
      case KeyCodes.down: {
        setCalloutFocussed(true);
        focusZoneRef.current?.focus();
        ev.preventDefault();
        break;
      }
      default:
        setCalloutFocussed(false);
    }
  };

  const renderProgressIndicator = () => {
    if (isLoading) {
      return <ProgressIndicator styles={ProgressIndicatorStyle} />;
    }
    return null;
  };

  const onSuggestionClicked = (suggestion: string | ISuggestionItem) => {
    let query =
      typeof suggestion === "string" ? suggestion : suggestion.getSearchText();
    setQuery(query);
    hideSuggestions();
    props.onSuggestionClicked(suggestion);
  };

  const hideSuggestions = () => {
    // console.log("HIDE CALLOUT");
    setIsCallOutVisible(false);
  };

  const onSuggestionKeyDown = (
    event: React.KeyboardEvent<any>,
    suggestion: ISuggestionItem
  ) => {
    console.log(event);
    if (event.which === KeyCodes.enter) onSuggestionClicked(suggestion);
  };
  const renderSuggestions = () => {
    let views: JSX.Element[] = [];
    if (!suggestions) return <></>;
    suggestions.forEach((suggestion: string | ISuggestionItem, i: number) => {
      if (typeof suggestion === "string") {
        views.push(getDefaultListItem(suggestion, i));
      } else {
        views.push(
          <Link
            style={{ margin: "2px" }}
            key={i}
            onKeyPress={(e) => onSuggestionKeyDown(e, suggestion)}
            onClick={(e) => onSuggestionClicked(suggestion)}
            className="oneSuggestion"
            role="listitem"
          >
            {suggestion.getSuggestionItem()}
          </Link>
        );
      }
    });

    return views;
  };

  const defaultSuggestionItem: React.CSSProperties = {
    width: "100%",
    float: "left",
    padding: "5px",
  };

  const getDefaultListItem = (suggestion: string, key: any) => {
    return (
      <div className="oneSuggestion" role="listitem" key={key}>
        <Link
          onClick={(e) => onSuggestionClicked(suggestion)}
          style={defaultSuggestionItem}
        >
          {suggestion}
        </Link>
      </div>
    );
  };

  const onCallOutDismiss = () => {
    setIsCallOutVisible(false);
  };

  const searchContainer: React.CSSProperties = {
    width: "fit-content",
    margin: "auto",
  };

  const onChange = (
    event?: React.ChangeEvent<HTMLInputElement> | undefined,
    newValue?: string | undefined
  ) => {
    setQuery(newValue || "");
    if (props.onChange) props.onChange(event, newValue);
  };
  return (
    <div style={searchContainer}>
      <div ref={textInput} className="searchBar">
        <SearchBox
          {...props}
          autoComplete="off"
          onChange={onChange}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          value={query}
        ></SearchBox>
      </div>
      <RenderIf
        condition={isLoading || (suggestions !== undefined && isCallOutVisible)}
      >
        <Callout
          styles={typeAheadCalloutStyle}
          isBeakVisible={false}
          target={textInput.current}
          onDismiss={onCallOutDismiss}
          directionalHint={DirectionalHint.bottomLeftEdge}
          directionalHintForRTL={DirectionalHint.bottomRightEdge}
          setInitialFocus={isCalloutFocussed}
          // hidden={!isCallOutVisible}
          doNotLayer={true}
        >
          {renderProgressIndicator()}
          <FocusZone
            direction={FocusZoneDirection.bidirectional}
            handleTabKey={FocusZoneTabbableElements.all}
            id="focusZoneSuggestions"
            componentRef={focusZoneRef}
          >
            {renderSuggestions()}
          </FocusZone>
        </Callout>
      </RenderIf>
    </div>
  );
};

export default AutocompleteSearchBox;
