import { useState } from "react";

function NewCountry({ onAddCountry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      alert("Country name cannot be empty or spaces only!");
      return;
    }

    onAddCountry(trimmedName);
    setName("");
    setIsOpen(false);
  };

  return (
    <div className="new-country">
      <button onClick={() => setIsOpen(true)}>➕ Add Country</button>

      {isOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Add New Country</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter country name"
              />
              <div className="dialog-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewCountry;
