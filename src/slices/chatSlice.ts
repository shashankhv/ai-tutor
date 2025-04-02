// slices/chatSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store'; // Adjust the path as needed

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  codeBlocks?: string[];
}

interface ChatState {
  messages: Message[];
  loading: boolean;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
};

function extractCodeBlocks(content: string): string[] {
  const regex = /```javascript\s*([\s\S]*?)```/g;
  const codeBlocks: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push(match[1].trim());
  }
  return codeBlocks;
}

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

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
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