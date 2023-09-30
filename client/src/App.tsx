import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Form from "./components/Form";
import axios from "axios";

function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  const [count, setCount] = useState(0);

  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api")
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data);
      });
  }, []);

  return (
    <div>
      <Form />
    </div>
  );
}

export default App;
