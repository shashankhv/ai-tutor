// slices/chatSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store'; // Adjust the path as needed

/**
 * Represents a single message in the chat.
 * @property {'user' | 'ai'} sender - The sender of the message.
 * @property {string} text - The text content of the message.
 * @property {string[]} [codeBlocks] - Optional array of code snippets extracted from the message.
 */
export interface Message {
  sender: 'user' | 'ai';
  text: string;
  codeBlocks?: string[];
}

/**
 * Represents the state of the chat slice.
 * @property {Message[]} messages - The list of messages in the chat.
 * @property {boolean} loading - A flag indicating if the chat is waiting for a response from the AI.
 */
interface ChatState {
  messages: Message[];
  loading: boolean;
}

/**
 * The initial state for the chat slice.
 * It starts with an empty list of messages and loading set to false.
 */
const initialState: ChatState = {
  messages: [],
  loading: false,
};

/**
 * Extracts JavaScript code blocks from a given string.
 * It looks for code enclosed in ```javascript ... ```.
 * @param {string} content - The string to search for code blocks.
 * @returns {string[]} An array of extracted code blocks.
 */
function extractCodeBlocks(content: string): string[] {
  const regex = /```javascript\s*([\s\S]*?)```/g;
  const codeBlocks: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push(match[1].trim());
  }
  return codeBlocks;
}

/**
 * An async thunk that handles sending a chat message to the AI and processing the response.
 * 1. It dispatches the user's message to the store.
 * 2. It sends the recent chat history to the AI API.
 * 3. It receives the AI's response, extracts any code blocks, and dispatches the AI's message to the store.
 * It also manages the `loading` state of the chat.
 * @param {string} content - The text of the user's message.
 * @param {object} thunkAPI - The thunk API object from Redux Toolkit.
 */
export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (content: string, { dispatch, getState }) => {
    // Dispatch the user's message.
    const newUserMessage: Message = { sender: 'user', text: content };
    dispatch(addMessage(newUserMessage));

    // Retrieve the current conversation history from state.
    const state = getState() as RootState;
    // Create a sliding window that includes the new message.
    // (In case the state update isn’t synchronous, we manually add our new message.)
    const chatHistory = [...state.chat.messages, newUserMessage];
    const slidingWindow = chatHistory.slice(-30);

    // Map our messages to the format expected by the API.
    const apiMessages = slidingWindow.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Prepend a system message to define your tutor’s behavior.
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful JavaScript tutor. Provide clear explanations, code challenges, and adapt based on the user’s progress.',
    };

    const messagesToSend = [systemMessage, ...apiMessages];

    // Use import.meta.env to get your secret key in a Vite environment.
    const secretKey = import.meta.env.VITE_AGENT_SECRET || '';

    const response = await axios.post(
      'https://agent-lc3uy75jsr3juh4f77aaq4js-mpbmh.ondigitalocean.app/api/v1/chat/completions',
      {
        messages: messagesToSend,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 16000,
        max_completion_tokens: 16000,
        stream: false,
        k: 5,
        retrieval_method: 'step_back',
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
        stream_options: { include_usage: true },
        kb_filters: [
          { index: '0000000-0000-0000-0000-000000000000', path: 'docs/javascript_tutorial.csv' },
          { index: '1111111-1111-1111-1111-111111111111' }
        ],
        filter_kb_content_by_query_metadata: false,
        instruction_override:
          "Answer only with the final answer. Do not include any internal reasoning or chain-of-thought.",
        include_functions_info: false,
        include_retrieval_info: false,
        include_guardrails_info: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secretKey}`,
        },
      }
    );

    let aiText = response.data.choices[0].message.content;
    const marker = "</think>";
    if (aiText.includes(marker)) {
      const parts = aiText.split(marker);
      aiText = parts[parts.length - 1].trim();
    }

    const codeBlocks = extractCodeBlocks(aiText);
    const aiMessage: Message = {
      sender: 'ai',
      text: aiText,
      codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
    };

    dispatch(addMessage(aiMessage));
  }
);

/**
 * The Redux slice for managing the chat state.
 * It includes reducers for adding messages and extra reducers to handle the
 * lifecycle of the `sendChatMessage` async thunk (pending, fulfilled, rejected).
 */
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * A reducer that adds a new message to the chat history.
     * @param {ChatState} state - The current chat state.
     * @param {PayloadAction<Message>} action - The action containing the message to add.
     */
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;