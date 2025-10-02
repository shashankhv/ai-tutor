import CodeEditor from "./CodeEditor";
import ChatBox from "./Chatbox";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

/**
 * The main application component.
 * It sets up the layout with a header and resizable panels for the code editor and chatbox.
 * @returns {JSX.Element} The rendered application component.
 */
const App = () => {
  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900">
      {/* Header */}
      <header className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-white">JavaScript AI Tutor</h1>
   
      </header>
      {/* Resizable Panels */}
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={60} minSize={20}>
          <div className="h-full p-4 ">
            <CodeEditor />
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-700 cursor-col-resize" />
        <Panel defaultSize={40} minSize={40}>
          <div className="h-full p-4">
            <ChatBox />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default App;