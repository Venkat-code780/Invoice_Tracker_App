import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { useGridFilter } from "ag-grid-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSearch } from "@fortawesome/free-solid-svg-icons";

const ResetIconFilter = ({ model, onModelChange, getValue }: any) => {
  const [filterText, setFilterText] = useState(model ? model.value : "");
    const inputRef = useRef<HTMLInputElement>(null);  // Reference to the input element


const normalizeVisibleText = (html: string) => {
  if (!html) return "";

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // 🔑 ONLY take visible text (exclude d-none spans)
  const visibleText = Array.from(tempDiv.childNodes)
    .filter(
      (node: any) =>
        !(node.nodeType === 1 && node.classList.contains("d-none"))
    )
    .map((node: any) => node.textContent || "")
    .join("");

  return visibleText
    .toLowerCase()
    // .replace(/[^0-9a-z]/gi, ""); // remove /, spaces, etc.
};

  const doesFilterPass = useCallback(
    ({ node }) => {
      const rawValue = getValue(node)?.toString() || "";

      const cellText = normalizeVisibleText(rawValue);
      const filterTextNorm = normalizeVisibleText(filterText);

      return !filterTextNorm || cellText.includes(filterTextNorm);
    },
    [filterText, getValue]
  );

  // Register logic with AG Grid hook
  useGridFilter({
    doesFilterPass,
    afterGuiAttached: () => {
        inputRef.current?.focus();
    }
  });

  React.useEffect(()=>{
    inputRef.current?.focus();
  },[])

  

  const onInputChange = (e: any) => {
    const newValue = e.target.value;
    setFilterText(newValue);
    onModelChange(newValue ? { value: newValue } : null);
  };

  const clearFilter = () => {
    setFilterText("");
    onModelChange(null);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        padding: "10px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
      }}
    >
      <input
        className="aggrid-custom-column-filter-search"
        type="text"
        value={filterText}
        onChange={onInputChange}
        placeholder="Search here..."
        style={{ flex: 1, border: "none", outline: "none", padding: "4px" }}
        ref={inputRef}
      />
      {filterText ? (
        <FontAwesomeIcon
          className="aggrid-custom-column-filter-clearIcon"
          icon={faXmark}
          onClick={clearFilter}
          style={{ cursor: "pointer", color: "#888", marginLeft: "8px" }}
        />
      ) : <FontAwesomeIcon tabIndex={1}
          className="aggrid-custom-column-filter-searchIcon"
          icon={faSearch}
          onClick={clearFilter}
          style={{ cursor: "pointer", color: "#888", marginLeft: "8px" }}
        />
    }
    </div>
  );
};

export default ResetIconFilter;
