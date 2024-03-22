import "./TestElement.css";
import { useTestContext } from "~/context/TestContext";

export default function TestElement() {
  const [testState, { updateTestStateData, secondFunction }] = useTestContext();
  return (
    <div
      class="TestElement"
      onClick={() => {
        if (testState() === true) {
          updateTestStateData(false);
        } else if (testState() === false) {
          updateTestStateData(true);
          secondFunction("Sup Bitch");
        }
        console.log(testState());
      }}
    >
      Test
    </div>
  );
}
