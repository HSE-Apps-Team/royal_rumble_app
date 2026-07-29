"use client";
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
            <tr key={rowIndex}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
