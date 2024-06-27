import { Title } from "@solidjs/meta";
import HeaderDefault from "~/components/layout/headerDefault";
import TestElement from "~/components/Test/TestElement";
import EventController from "../components/eventManagement/eventController";

import "../routeStyling/home.css";

export default function Home() {
  <Title>Home</Title>;
  return (
    <>
      <HeaderDefault />
      <div class="homePageContainer">
        <EventController />
      </div>
    </>
  );
}
