import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Represents the state of the code slice.
 * @property {string} code - The current code in the editor.
 */
interface CodeState {
  code: string;
}

/**
 * The initial state for the code slice.
 * It provides a default FizzBuzz challenge as a sample.
 */
const initialState: CodeState = {
  code: `// 🧪 Sample JS: FizzBuzz Challenge
function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}

fizzBuzz(15);
`,
};

/**
 * The Redux slice for managing the code editor's state.
 * It includes a reducer to update the code.
 */
const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    /**
     * A reducer that updates the code in the state.
     * @param {CodeState} state - The current code state.
     * @param {PayloadAction<string>} action - The action containing the new code.
     */
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
  },
});

export const { setCode } = codeSlice.actions;
export default codeSlice.reducer;