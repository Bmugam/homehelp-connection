import * as React from "react";

interface CreatableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select or type to add..."
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [filteredOptions, setFilteredOptions] = React.useState<string[]>(options);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setInputValue("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      if (!options.includes(inputValue.trim())) {
        onChange(inputValue.trim());
      }
      setInputValue("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        placeholder={placeholder}
        value={isOpen ? inputValue : value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 text-sm shadow-lg">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="cursor-pointer px-3 py-1 hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreatableSelect;
