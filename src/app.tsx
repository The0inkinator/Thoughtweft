import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { EventContextProvider } from "./context/EventContext";
import "./app.css";
import "./styling/globalFonts.css";
import "./styling/elementStyles.css";
import { HovRefContextProvider } from "./context/HovRefContext";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Thoughtweft</Title>
          <EventContextProvider>
            <HovRefContextProvider>
              <Suspense>{props.children}</Suspense>
            </HovRefContextProvider>
          </EventContextProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
