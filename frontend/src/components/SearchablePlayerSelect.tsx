import React, { useEffect, useId, useRef, useState } from "react";
import ApiService from "../services/api";
import { PlayerOption } from "../types";

interface SearchablePlayerSelectProps {
  id: string;
  label: string;
  value?: number;
  displayValue?: string;
  onChange: (playerId?: number, displayName?: string) => void;
  placeholder?: string;
}

const SearchablePlayerSelect: React.FC<SearchablePlayerSelectProps> = ({
  id,
  label,
  value,
  displayValue = "",
  onChange,
  placeholder = "Search by name...",
}) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(displayValue);
  const [options, setOptions] = useState<PlayerOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await ApiService.getPlayerOptions(query.trim(), 25);
        setOptions(results);
      } catch (error) {
        console.error("Failed to load player options", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, query]);

  const handleSelect = (option: PlayerOption) => {
    onChange(option.player_id, option.display_name);
    setQuery(option.display_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined, undefined);
    setQuery("");
    setOptions([]);
  };

  return (
    <div className="filter-group searchable-select" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <div className="searchable-select-input-wrap">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            if (value !== undefined) {
              onChange(undefined, undefined);
            }
          }}
        />
        {(value !== undefined || query) && (
          <button
            type="button"
            className="searchable-select-clear"
            onClick={handleClear}
            aria-label={`Clear ${label}`}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <ul id={listboxId} className="searchable-select-list" role="listbox">
          {isLoading ? (
            <li className="searchable-select-status">Searching...</li>
          ) : options.length === 0 ? (
            <li className="searchable-select-status">No players found</li>
          ) : (
            options.map((option) => (
              <li key={option.player_id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.player_id}
                  className={
                    value === option.player_id
                      ? "searchable-select-option selected"
                      : "searchable-select-option"
                  }
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.display_name}</span>
                  <span className="searchable-select-meta">
                    {option.team} · {option.primary_position}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchablePlayerSelect;
