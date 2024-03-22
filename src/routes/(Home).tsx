import { Title } from "@solidjs/meta";
import HeaderDefault from "~/components/layout/headerDefault";
import PodBox from "~/components/pairing/podBox";
import TestElement from "~/components/Test/TestElement";

import "../routeStyling/home.css";

export default function Home() {
  <Title>Home</Title>;
  return (
    <>
      <HeaderDefault />
      <div class="homePageContainer">
        <PodBox />
        <TestElement />
      </div>
    </>
  );
}
