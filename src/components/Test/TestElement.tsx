import "./TestElement.css";
import { useTestContext } from "~/context/TestContext";

export default function TestElement() {
  const [testState, { updateTestStateData, secondFunction }] = useTestContext();
  return <div class="TestElement">Test</div>;
}
