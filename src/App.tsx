import { Provider } from "react-redux";
import { store } from "./store";
import SelfConfidenceTracker from "./components/SelfConfidenceTracker";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <SelfConfidenceTracker />
    </Provider>
  );
}

export default App;
