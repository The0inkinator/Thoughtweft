import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { EventContextProvider } from "./context/EventContext";
import "./app.css";
import "./styling/globalFonts.css";
import "./styling/elementStyles.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Thoughtweft</Title>
          <EventContextProvider>
            <Suspense>{props.children}</Suspense>
          </EventContextProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
