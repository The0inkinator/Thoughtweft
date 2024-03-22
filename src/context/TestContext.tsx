import { createContext, useContext, createSignal } from "solid-js";

type TestState = [
  () => boolean,
  {
    updateTestStateData: (input: boolean) => void;
    secondFunction: (input: string) => void;
  }
];

const TestContext = createContext<TestState | undefined>();

export function TestProvider(props: any) {
  const [testStateData, setTestStateData] = createSignal<boolean>(true),
    testState: TestState = [
      () => testStateData(),
      {
        updateTestStateData(input: boolean) {
          setTestStateData(input);
        },

        secondFunction(input: string) {
          console.log(input);
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
  return useContext(TestContext)!; // Adding '!' to assert non-null
}
