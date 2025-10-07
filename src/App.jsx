import { useEffect, useState, useRef } from "react";
import Country from "./components/Country";
import Login from "./components/Login";
import Logout from "./components/Logout";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
  Tooltip,
  Dialog,
  Text,
  AlertDialog,
  Callout,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";
import axios from "axios";
import { getUser } from "./Utils.js";
import { HubConnectionBuilder } from "@microsoft/signalr";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [toasts, setToasts] = useState([]);
  const [alertDialog, setAlertDialog] = useState({ open: false, title: "", description: "" });
  const apiEndpoint = "https://medals-api-aiello-evcwe7c5ajdne9c3.canadacentral-01.azurewebsites.net/jwtapi/country";
  const hubEndpoint = "https://medals-api-aiello-evcwe7c5ajdne9c3.canadacentral-01.azurewebsites.net/medalsHub"
  const userEndpoint = "https://jwtswagger.azurewebsites.net/api/user/login";
  // const apiEndpoint = "http://localhost:5230/api/country"

  const [connection, setConnection] = useState(null);
  const [countries, setCountries] = useState([]);
  const [user, setUser] = useState({
    name: null,
    authenticated: false,
    canPost: false,
    canPatch: false,
    canDelete: false,
  });
  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);
  const latestCountries = useRef(null);
  // latestCountries is a ref variable to countries (state)
  // this is needed to access state variable in useEffect w/o dependency
  latestCountries.current = countries;

  useEffect(() => {
    // initial data loaded here
    async function fetchCountries() {
      const { data: fetchedCountries } = await axios.get(apiEndpoint);
      // we need to save the original medal count values in state
      let newCountries = [];
      fetchedCountries.forEach((country) => {
        let newCountry = {
          id: country.id,
          name: country.name,
        };
        medals.current.forEach((medal) => {
          const count = country[medal.name];
          // page_value is what is displayed on the web page
          // saved_value is what is saved to the database
          newCountry[medal.name] = { page_value: count, saved_value: count };
        });
        newCountries.push(newCountry);
      });
      setCountries(newCountries);
      showToast("Olympic medals data loaded successfully!", "success");
    }
    fetchCountries();

    const encoded = localStorage.getItem("token");
    // check for existing token
    encoded && setUser(getUser(encoded));

    // signalR
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubEndpoint)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          showToast("Connected to real-time updates!", "success");

          connection.on("ReceiveAddMessage", (country) => {
            showToast(`Country "${country.name}" was added`, "info");

            let newCountry = {
              id: country.id,
              name: country.name,
            };
            medals.current.forEach((medal) => {
              const count = country[medal.name];
              newCountry[medal.name] = {
                page_value: count,
                saved_value: count,
              };
            });
            // we need to use a reference to countries array here
            // since this useEffect has no dependeny on countries array - it is not in scope
            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.concat(newCountry);
            setCountries(mutableCountries);
          });

          connection.on("ReceiveDeleteMessage", (id) => {
            showToast(`Country was deleted`, "info");

            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.filter((c) => c.id !== id);
            setCountries(mutableCountries);
          });

          connection.on("ReceivePatchMessage", (country) => {
            showToast(`Country "${country.name}" was updated`, "info");

            let updatedCountry = {
              id: country.id,
              name: country.name,
            };
            medals.current.forEach((medal) => {
              const count = country[medal.name];
              updatedCountry[medal.name] = {
                page_value: count,
                saved_value: count,
              };
            });
            let mutableCountries = [...latestCountries.current];
            const idx = mutableCountries.findIndex((c) => c.id === country.id);
            mutableCountries[idx] = updatedCountry;

            setCountries(mutableCountries);
          });
        })
        .catch(() => showToast("Connection to real-time updates failed", "error"));
    }
    // useEffect is dependent on changes to connection
  }, [connection]);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }

  function showAlert(title, description) {
    setAlertDialog({ open: true, title, description });
  }

  function showToast(message, type = "info") {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }
  async function handleAdd(name) {
    try {
      await axios.post(
        apiEndpoint,
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      showToast("Country added successfully!", "success");
    } catch (ex) {
      if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {
        showAlert("Authorization Error", "You are not authorized to complete this request");
      } else if (ex.response) {
        showToast("Request failed with server error", "error");
      } else {
        showToast("Request failed", "error");
      }
    }
  }
  async function handleDelete(countryId) {
    const originalCountries = countries;
    setCountries(countries.filter((c) => c.id !== countryId));
    try {
      await axios.delete(`${apiEndpoint}/${countryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        showToast("The record does not exist - it may have already been deleted", "warning");
      } else {
        setCountries(originalCountries);
        if (
          ex.response &&
          (ex.response.status === 401 || ex.response.status === 403)
        ) {
          showAlert("Authorization Error", "You are not authorized to complete this request");
        } else if (ex.response) {
          showToast("Request failed with server error", "error");
        } else {
          showToast("Request failed", "error");
        }
      }
    }
  }
  function handleIncrement(countryId, medalName) {
    handleUpdate(countryId, medalName, 1);
  }
  function handleDecrement(countryId, medalName) {
    handleUpdate(countryId, medalName, -1);
  }
  function handleUpdate(countryId, medalName, factor) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName].page_value += 1 * factor;
    setCountries(mutableCountries);
  }
  async function handleSave(countryId) {
    const originalCountries = countries;

    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    const country = mutableCountries[idx];
    let jsonPatch = [];
    medals.current.forEach((medal) => {
      if (country[medal.name].page_value !== country[medal.name].saved_value) {
        jsonPatch.push({
          op: "replace",
          path: medal.name,
          value: country[medal.name].page_value,
        });
        country[medal.name].saved_value = country[medal.name].page_value;
      }
    });
    showToast(`Saving changes for country (${jsonPatch.length} updates)`, "info");
    // update state
    setCountries(mutableCountries);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      showToast("Changes saved successfully!", "success");
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        showToast("The record does not exist - it may have already been deleted", "warning");
      } else if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {
        showAlert("Authorization Error", "You are not authorized to complete this request");
        // to simplify, I am reloading the page to restore "saved" values
        window.location.reload(false);
      } else {
        showAlert("Update Error", "An error occurred while updating");
        setCountries(originalCountries);
      }
    }
  }
  function handleReset(countryId) {
    // to reset, make page value the same as the saved value
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    const country = mutableCountries[idx];
    medals.current.forEach((medal) => {
      country[medal.name].page_value = country[medal.name].saved_value;
    });
    setCountries(mutableCountries);
  }
  async function handleLogin(username, password) {
    try {
      const resp = await axios.post(userEndpoint, {
        username: username,
        password: password,
      });
      const encoded = resp.data.token;
      localStorage.setItem("token", encoded);
      setUser(getUser(encoded));
      showToast("Login successful!", "success");
    } catch (ex) {
      if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 400)
      ) {
        showAlert("Login Error", "Login failed - please check your credentials");
      } else if (ex.response) {
        showToast("Login failed with server error", "error");
      } else {
        showToast("Login request failed", "error");
      }
    }
  }
  function handleLogout() {
    localStorage.removeItem("token");
    setUser({
      name: null,
      authenticated: false,
      canPost: false,
      canPatch: false,
      canDelete: false,
    });
    showToast("Logged out successfully!", "info");
  }
  function getAllMedalsTotal() {
    let sum = 0;
    // use medal count displayed in the web page for medal count totals
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + b[medal.name].page_value, 0);
    });
    return sum;
  }

  return (
    <Theme appearance={appearance}>
      <Tooltip content={`Switch to ${appearance === "dark" ? "light" : "dark"} theme`}>
        <Button
          onClick={toggleAppearance}
          style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
          variant="ghost"
        >
          {appearance === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </Tooltip>
      {user.authenticated ? (
        <Logout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        {user.canPost && <NewCountry onAdd={handleAdd} />}
      </Flex>
      <Container className="bg"></Container>
      <Grid pt="2" gap="2" className="grid-container">
        {countries
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((country) => (
            <Country
              key={country.id}
              country={country}
              medals={medals.current}
              canDelete={user.canDelete}
              canPatch={user.canPatch}
              onDelete={handleDelete}
              onSave={handleSave}
              onReset={handleReset}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>

      {/* Toast-like notifications using Callout */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, display: "flex", flexDirection: "column", gap: "8px" }}>
        {toasts.map((toast) => (
          <Callout.Root
            key={toast.id}
            color={toast.type === "success" ? "green" : toast.type === "error" ? "red" : toast.type === "warning" ? "orange" : "blue"}
            variant="surface"
            style={{ minWidth: "300px", maxWidth: "400px", position: "relative" }}
          >
            <Callout.Icon>
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "❌"}
              {toast.type === "warning" && "⚠️"}
              {toast.type === "info" && "ℹ️"}
            </Callout.Icon>
            <Callout.Text>
              {toast.message}
            </Callout.Text>
            <Button 
              size="1" 
              variant="ghost" 
              style={{ position: "absolute", top: "8px", right: "8px" }}
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              ×
            </Button>
          </Callout.Root>
        ))}
      </div>

      {/* Alert Dialog */}
      <AlertDialog.Root open={alertDialog.open} onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, open }))}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>{alertDialog.title}</AlertDialog.Title>
          <AlertDialog.Description>{alertDialog.description}</AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">OK</Button>
            </AlertDialog.Cancel>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Theme>
  );
}

export default App;