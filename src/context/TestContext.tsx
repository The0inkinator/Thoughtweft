import { createContext, useContext, createSignal } from "solid-js";

const TestContext = createContext();

export function TestProvider(props: any) {
  const [testStateData, setTestStateData] = createSignal<boolean>(true),
    testState = [
      testStateData,
      {
        updateTestStateData(input: boolean) {
          setTestStateData(input);
        },
      },
    ];

  return (
    <TestContext.Provider value={testState}>
      {props.children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  return useContext(TestContext);
}
