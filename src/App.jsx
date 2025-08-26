import { useState, useRef } from "react";
import Country from "./components/Country";
import './App.css'

function App() {
  const [countries, setCountries] = useState([
    { id: 1, name: "United States", gold: 2 },
    { id: 2, name: "China", gold: 3 },
    { id: 3, name: "France", gold: 0 },
  ]);

  const medals = useRef([
    {id: 1, name: "gold"},
    {id: 2, name: "silver"},
    {id: 3, name: "bronze"},
  ]);

  const deleteCountry = (id) => {
    setCountries(countries.filter((country) => country.id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏅 Olympic Medals 🏅</h1>
      {countries.length === 0 ? (
        <p style={{ fontSize: "18px", color: "gray" }}>
          No countries left!
        </p>
      ) : (
        <div style={{ display: "flex", gap: "12px" }}>
          {countries.map((country) => (
            <Country
              key={country.id}
              id={country.id}
              name={country.name}
              medals={medals.current}
              onDelete={deleteCountry}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
