import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* Add other routes here as we progress */}
    </Routes>
  );
};

export default App;
