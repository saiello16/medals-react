import { useState } from "react";
import Country from "./components/Country";
import NewCountry from "./components/NewCountry";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([
    { id: 1, name: "United States", gold: 2, silver: 2, bronze: 3 },
    { id: 2, name: "China", gold: 3, silver: 1, bronze: 0 },
    { id: 3, name: "France", gold: 0, silver: 2, bronze: 2 },
  ]);

  // Increment medals
  const handleIncrement = (countryId, medalType) => {
    setCountries((prev) =>
      prev.map((c) =>
        c.id === countryId ? { ...c, [medalType]: c[medalType] + 1 } : c
      )
    );
  };

  // Decrement medals (only if > 0)
  const handleDecrement = (countryId, medalType) => {
    setCountries((prev) =>
      prev.map((c) =>
        c.id === countryId && c[medalType] > 0
          ? { ...c, [medalType]: c[medalType] - 1 }
          : c
      )
    );
  };

  // Delete a country
  const handleDelete = (countryId) => {
    setCountries((prev) => prev.filter((c) => c.id !== countryId));
  };

  // Add new country
  const handleAddCountry = (name) => {
    setCountries((prev) => [
      ...prev,
      {
        id: Date.now(), // simple unique id
        name,
        gold: 0,
        silver: 0,
        bronze: 0,
      },
    ]);
  };


  // Totals across all countries
  const totalGold = countries.reduce((sum, c) => sum + c.gold, 0);
  const totalSilver = countries.reduce((sum, c) => sum + c.silver, 0);
  const totalBronze = countries.reduce((sum, c) => sum + c.bronze, 0);
  const totalMedals = totalGold + totalSilver + totalBronze;

  return (
    <div className="app">
      <h1>Olympic Medals {totalMedals}</h1>

      {/* NewCountry Trigger */}
      <NewCountry onAddCountry={handleAddCountry} />
      
      <div className="countries">
        {countries.map((country) => (
          <Country
            key={country.id}
            country={country}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
