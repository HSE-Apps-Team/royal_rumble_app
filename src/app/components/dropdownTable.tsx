"use client";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

interface DropdownTableProps {
  headers: string[];
  data: any[];
  idIndex?: number;
  visibleColumns: number[];
  dropdownValues: (string | number)[];
  dropdownDisplayTexts?: (string | null)[];
  currentDropdownColumnIndex: number;
  dropdownHeader?: string;
  reassignAction?: (
    id: string | number,
    newValue: string | number,
  ) => Promise<void>;
  // When true, each row shows a free-text input instead of a <select>.
  // The raw text the admin typed is passed to reassignAction/resolveTextValue
  // as-is (e.g. "Group 1" or "1") so the caller can resolve it.
  useTextInput?: boolean;
  // Text-input mode only: resolves what the admin typed into an actual
  // dropdown value. Return null if the text doesn't match anything.
  resolveTextValue?: (text: string) => string | number | null;
  textInputPlaceholder?: string;
}

export default function DropdownTable({
  headers,
  data,
  idIndex,
  visibleColumns,
  dropdownValues,
  dropdownDisplayTexts,
  currentDropdownColumnIndex,
  dropdownHeader,
  reassignAction,
  useTextInput,
  resolveTextValue,
  textInputPlaceholder,
}: DropdownTableProps) {
  const colCount = visibleColumns.length + 1;

  return (
    <div>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          height: "300px",
          border: "4px solid var(--primaryBlue)",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <thead>
          <tr>
            {visibleColumns.map((colIndex) => (
              <th
                key={colIndex}
                style={{
                  backgroundColor: "var(--primaryBlue)",
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "12px",
                  border: "2px solid var(--primaryBlue)",
                }}
              >
                {headers[colIndex]}
              </th>
            ))}
            <th
              style={{
                backgroundColor: "var(--primaryBlue)",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                padding: "12px",
                border: "2px solid var(--primaryBlue)",
              }}
            >
              {dropdownHeader}
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={idIndex !== undefined ? String(row[idIndex]) : rowIndex}>
              {visibleColumns.map((ci) => (
                <td
                  key={ci}
                  style={{
                    backgroundColor: "white",
                    padding: "12px",
                    border: "2px solid var(--primaryBlue)",
                    fontSize: "20px",
                  }}
                >
                  {row[ci] ?? ""}
                </td>
              ))}

              <td
                style={{
                  backgroundColor: "white",
                  padding: "12px",
                  border: "2px solid var(--primaryBlue)",
                }}
              >
                {useTextInput ? (
                  <TextInputCell
                    currentValue={
                      row[currentDropdownColumnIndex] !== null &&
                      row[currentDropdownColumnIndex] !== undefined
                        ? String(row[currentDropdownColumnIndex])
                        : ""
                    }
                    dropdownDisplayTexts={dropdownDisplayTexts}
                    dropdownValues={dropdownValues}
                    placeholder={textInputPlaceholder}
                    onSubmit={async (text) => {
                      if (!reassignAction || idIndex === undefined) return null;
                      const id = row[idIndex];

                      const trimmed = text.trim();
                      if (!trimmed || trimmed.toLowerCase() === "unassigned") {
                        await reassignAction(id, "unassigned");
                        return null;
                      }

                      const resolved = resolveTextValue
                        ? resolveTextValue(trimmed)
                        : trimmed;
                      if (resolved === null) return false;

                      await reassignAction(id, resolved);
                      return resolved;
                    }}
                  />
                ) : (
                  <select
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "16px",
                      fontFamily: "Poppins, sans-serif",
                      border: "2px solid var(--primaryBlue)",
                      borderRadius: "4px",
                      backgroundColor: "white",
                      color: "var(--textBlack)",
                      cursor: "pointer",
                    }}
                    value={
                      row[currentDropdownColumnIndex] !== null &&
                      row[currentDropdownColumnIndex] !== undefined
                        ? String(row[currentDropdownColumnIndex])
                        : "unassigned"
                    }
                    onChange={async (e) => {
                      if (reassignAction && idIndex !== undefined) {
                        const id = row[idIndex];
                        const newValue = e.target.value;
                        await reassignAction(id, newValue);
                      }
                    }}
                  >
                    <option value="unassigned">Unassigned</option>

                    {dropdownValues.map((group, index) => (
                      <option key={group} value={String(group)}>
                        {dropdownDisplayTexts
                          ? dropdownDisplayTexts[index]
                          : group}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TextInputCellProps {
  currentValue: string;
  dropdownValues: (string | number)[];
  dropdownDisplayTexts?: (string | null)[];
  placeholder?: string;
  onSubmit: (text: string) => Promise<string | number | null | false>;
}

function TextInputCell({
  currentValue,
  dropdownValues,
  dropdownDisplayTexts,
  placeholder,
  onSubmit,
}: TextInputCellProps) {
  const displayForValue = (value: string) => {
    if (!value || value === "unassigned") return "";
    const index = dropdownValues.findIndex((v) => String(v) === value);
    if (index === -1) return value;
    return dropdownDisplayTexts?.[index] ?? value;
  };

  const initialDisplay = displayForValue(currentValue);
  const [text, setText] = useState(initialDisplay);
  const [error, setError] = useState(false);

  const commit = async () => {
    if (text.trim() === initialDisplay.trim() && !error) return;

    setError(false);
    const resolved = await onSubmit(text);
    if (resolved === false) {
      setError(true);
    } else {
      setText(displayForValue(resolved === null ? "unassigned" : String(resolved)));
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        placeholder={placeholder ?? "Type group number..."}
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: "16px",
          fontFamily: "Poppins, sans-serif",
          border: `2px solid ${error ? "var(--primaryRed)" : "var(--primaryBlue)"}`,
          borderRadius: "4px",
          backgroundColor: "white",
          color: "var(--textBlack)",
        }}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(false);
        }}
        onBlur={commit}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {error && (
        <div
          style={{
            color: "var(--primaryRed)",
            fontSize: "12px",
            marginTop: "2px",
          }}
        >
          No matching group found.
        </div>
      )}
    </div>
  );
}
