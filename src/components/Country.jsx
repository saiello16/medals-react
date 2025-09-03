import React from "react";
import { FaTrash } from "react-icons/fa"; // using react-icons for trash icon
import Medal from "./Medal";

function Country({ country, onIncrement, onDecrement, onDelete }) {
  const total = country.gold + country.silver + country.bronze;

  return (
    <div className="country">
      <div className="country-header">
        <h3>{country.name} <span>{total}</span></h3>
        <button
          onClick={() => onDelete(country.id)}
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

      <Medal
        medalType="gold"
        count={country.gold}
        onIncrement={() => onIncrement(country.id, "gold")}
        onDecrement={() => onDecrement(country.id, "gold")}
      />

      <Medal
        medalType="silver"
        count={country.silver}
        onIncrement={() => onIncrement(country.id, "silver")}
        onDecrement={() => onDecrement(country.id, "silver")}
      />

      <Medal
        medalType="bronze"
        count={country.bronze}
        onIncrement={() => onIncrement(country.id, "bronze")}
        onDecrement={() => onDecrement(country.id, "bronze")}
      />
    </div>
  );
}

export default Country;
