import type { ChatInputProps } from "@/app/types/chat";
import useWhisper from "@chengsokdara/use-whisper";

export default function ChatInput({ input, setInput, loading, sendMessage, doTranscribe }: ChatInputProps) {

  const { startRecording, stopRecording, recording } = useWhisper({
    onTranscribe: doTranscribe,
  });

  return (
    <form onSubmit={sendMessage}>
      <label className="hidden" htmlFor="message">
        Enter your message here:
      </label>
      <input
        id="message"
        name="message"
        value={input}
        placeholder="What's on your mind?..."
        onChange={(event) => setInput(event.target.value)}
        className="w-56 md:w-72 lg:w-96 p-4 border-2 text-white bg-transparent focus:outline-none"
      />
      <button
        type="submit"
        title="Send message"        
        className="w-24 md:w-24 lg:w-auto px-4 lg:px-8 py-4 border-2 border-white bg-white text-black"
      >

        {loading ? <p className="animate-spin">⏳</p> : "Ask Siri"}
      </button>

      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className="w-24 md:w-24 lg:w-auto px-4 lg:px-8 py-4 border-2 border-white bg-gray-300 text-black"
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>      
    </form>
  );
}
