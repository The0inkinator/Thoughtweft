import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { PlayersProvider } from "./context/PlayersContext";
import { TestProvider } from "./context/TestContext";
import { PodContextProvider } from "./context/PodContext";
import { EventContextProvider } from "./context/EventContext";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Thoughtweft</Title>
          <TestProvider>
            <PlayersProvider>
              <PodContextProvider>
                <EventContextProvider>
                  <Suspense>{props.children}</Suspense>
                </EventContextProvider>
              </PodContextProvider>
            </PlayersProvider>
          </TestProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
