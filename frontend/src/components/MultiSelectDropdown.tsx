import React, { useEffect, useId, useMemo, useRef, useState } from "react";

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  options: string[];
  values?: string[];
  onChange: (values: string[] | undefined) => void;
  placeholder?: string;
}

function formatSelection(values: string[] | undefined, placeholder: string): string {
  if (!values || values.length === 0) {
    return placeholder;
  }
  if (values.length <= 2) {
    return values.join(", ");
  }
  return `${values.length} selected`;
}

function toggleValue(values: string[] | undefined, value: string): string[] {
  const current = values ?? [];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

function filterOptions(options: string[], search: string): string[] {
  const term = search.trim().toLowerCase();
  if (!term) {
    return options;
  }
  return options.filter((option) => option.toLowerCase().includes(term));
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  options,
  values,
  onChange,
  placeholder = "All",
}) => {
  const listboxId = useId();
  const searchInputId = `${id}-search`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(
    () => filterOptions(options, searchQuery),
    [options, searchQuery]
  );

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
      setSearchQuery("");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const handleToggle = (option: string) => {
    const nextValues = toggleValue(values, option);
    onChange(nextValues.length > 0 ? nextValues : undefined);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(undefined);
  };

  const handleSelectAll = () => {
    const current = new Set(values ?? []);
    filteredOptions.forEach((option) => current.add(option));
    const nextValues = Array.from(current);
    onChange(nextValues.length > 0 ? nextValues : undefined);
  };

  const handleDeselectAll = () => {
    const filtered = new Set(filteredOptions);
    const nextValues = (values ?? []).filter((value) => !filtered.has(value));
    onChange(nextValues.length > 0 ? nextValues : undefined);
  };

  const hasSelection = (values?.length ?? 0) > 0;
  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => values?.includes(option));

  return (
    <div className="filter-group multi-select-dropdown" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <div className="multi-select-dropdown-input-wrap">
        <button
          id={id}
          type="button"
          className="multi-select-dropdown-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span
            className={
              hasSelection
                ? "multi-select-dropdown-value"
                : "multi-select-dropdown-placeholder"
            }
          >
            {formatSelection(values, placeholder)}
          </span>
          <span className="multi-select-dropdown-chevron" aria-hidden="true">
            ▾
          </span>
        </button>
        {hasSelection && (
          <button
            type="button"
            className="multi-select-dropdown-clear"
            onClick={handleClear}
            aria-label={`Clear ${label}`}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="multi-select-dropdown-panel">
          <div className="multi-select-dropdown-toolbar">
            <input
              ref={searchInputRef}
              id={searchInputId}
              type="search"
              className="multi-select-dropdown-search"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label={`Search ${label}`}
            />
            <div className="multi-select-dropdown-actions">
              <button
                type="button"
                className="multi-select-dropdown-action"
                onClick={handleSelectAll}
                disabled={filteredOptions.length === 0 || allFilteredSelected}
              >
                Select All
              </button>
              <button
                type="button"
                className="multi-select-dropdown-action"
                onClick={handleDeselectAll}
                disabled={
                  filteredOptions.length === 0 ||
                  !filteredOptions.some((option) => values?.includes(option))
                }
              >
                Deselect All
              </button>
            </div>
          </div>

          <ul
            id={listboxId}
            className="multi-select-dropdown-list"
            role="listbox"
            aria-multiselectable="true"
          >
            {filteredOptions.length === 0 ? (
              <li className="multi-select-dropdown-status">No matches found</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values?.includes(option) ?? false;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={
                        isSelected
                          ? "multi-select-dropdown-option selected"
                          : "multi-select-dropdown-option"
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleToggle(option)}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        tabIndex={-1}
                        checked={isSelected}
                        aria-hidden="true"
                      />
                      <span>{option}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
