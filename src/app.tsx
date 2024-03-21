import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { PlayersProvider } from "./context/PlayersContext";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Thoughtweft</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <PlayersProvider playersState={null}>
        <FileRoutes />
      </PlayersProvider>
    </Router>
  );
}
