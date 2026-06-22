import "./App.css";

import BackendStatusAlert from "./components/BackendStatusAlert";
import Router from "./router/Routers";

function App() {
  return (
    <>
      <BackendStatusAlert />
      <Router />
    </>
  );
}

export default App;
