import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { PlayersProvider } from "./context/PlayersContext";
import { TestProvider } from "./context/TestContext";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Thoughtweft</Title>
          <TestProvider testState={true}>
            <PlayersProvider playersState={null}>
              <Suspense>{props.children}</Suspense>
            </PlayersProvider>
          </TestProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
