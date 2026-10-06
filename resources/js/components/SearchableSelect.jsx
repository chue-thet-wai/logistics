import React, { useState, useRef, useEffect } from "react";

const SearchableSelect = ({
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Search...",
  className = "",
  disabled = false,
  error = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const hasError = Boolean(error);

  // Sync textbox with selected value
  useEffect(() => {
    const selected = options.find(opt => opt.value == value);
    if (selected) {
      setSearch(selected.label);
    } else {
      setSearch("");
    }
  }, [value, options]);

  // Show all if empty, filter if typing
  const filteredOptions =
    search.trim() === ""
      ? options
      : options.filter(opt =>
          opt.label.toLowerCase().includes(search.toLowerCase())
        );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSearch(option.label);
    onChange({
      target: { name, value: option.value }
    });
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearch(inputValue);
    setOpen(true);

    // If cleared → reset selected value
    if (inputValue.trim() === "") {
      onChange({
        target: { name, value: "" }
      });
    }
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      
      {/* Textbox */}
      <input
        type="text"
        name={name}
        value={search}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-md shadow-sm
          ${hasError ? "border-red-500" : "border-gray-300"}
          focus:outline-none focus:ring-2
          ${hasError ? "focus:ring-red-500" : "focus:ring-primary-theme-color"}
          ${className}
        `}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;