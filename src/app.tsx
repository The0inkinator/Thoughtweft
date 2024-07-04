import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import { TestProvider } from "./context/TestContext";

import { EventContextProvider } from "./context/EventContext";

import "./app.css";
import "./styling/globalFonts.css";
import { HovRefContextProvider } from "./context/HovRefContext";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Thoughtweft</Title>
          <TestProvider>
            <EventContextProvider>
              <HovRefContextProvider>
                <Suspense>{props.children}</Suspense>
              </HovRefContextProvider>
            </EventContextProvider>
          </TestProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
