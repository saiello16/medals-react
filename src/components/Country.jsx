import React from "react";
import { FaTrash } from "react-icons/fa"; // using react-icons for trash icon
import Medal from "./Medal";

function Country({ id, name, medals, onDelete }) {
  return (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: "8px",
        padding: "10px",
        minWidth: "160px",
        backgroundColor: "#a11e8bff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{name}</h2>
        <button
          onClick={() => onDelete(id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#333",
          }}
          title="Delete country"
        >
          <FaTrash />
        </button>
      </div>
      <div className="medals">
        {medals.map((medal) => (
          <Medal key={medal.id} medal={medal} />
        ))}
      </div>
    </div>
  );
}

export default Country;
