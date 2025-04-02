import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CodeState {
  code: string;
}

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

const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
  },
});

export const { setCode } = codeSlice.actions;
export default codeSlice.reducer;