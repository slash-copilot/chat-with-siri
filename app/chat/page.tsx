"use client";

import { useState,  useRef } from "react";
import ChatMessages from "@/app/components/chatMessages";
import ChatControls from "@/app/components/chatControls";
import ChatInput from "@/app/components/chatInput";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import notifyUser from "@/app/utils/notifyUser";
import { userRole, botRole, Message } from "@/app/types/chat";
import axios from "axios";

export default function ChatPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isModal, setIsModal] = useState(false);
  const [openAiKey, setOpenAiKey] = useLocalStorage<string>("openai-key", "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useLocalStorage<Message[]>("chatMessages", []);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedAudio, setSavedAudio] = useState<boolean>(false);

  const getOpenAIResponse = async (chatMessages: Message[]) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ apiKey: openAiKey, messages: chatMessages })
    });

    if (response.status === 401) {
      notifyUser("Your OpenAI API Key is invalid. Kindly check and try again.", {
        type: "error",
        autoClose: 5000
      });
    }

    const data = await response.json();
    return data;
  };

  const getElevenLabsResponse = async (text: string) => {
    const response = await fetch("/api/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
      })
    });

    if (response.status === 401) {
      notifyUser("Your ElevenLabs API Key is invalid. Kindly check and try again.", {
        type: "error",
        autoClose: 5000
      });
    }

    const data = await response.blob();
    return data;
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isProduction = process.env.NEXT_PUBLIC_APP_MODE === "production";

    if (isProduction && !openAiKey) {
      setIsModal(true);
    } else {
      setLoading(true);
      setInput("");

      const chatMessages: Message[] = [...messages, { role: userRole, content: input }];
      setMessages(chatMessages);

      const botChatResponse = await getOpenAIResponse(chatMessages);
      const botVoiceResponse = await getElevenLabsResponse(botChatResponse);

      const reader = new FileReader();
      reader.readAsDataURL(botVoiceResponse);
      reader.onload = () => {
        if (audioRef.current) {
          audioRef.current.src = reader.result as string;
          audioRef.current.play();
        }
      };

      setMessages([...chatMessages, { role: botRole, content: botChatResponse }]);
      setLoading(false);
      setSavedAudio(true);
    }
  };

  const doTranscribe = async (blob: Blob) => {
    const base64 = await new Promise<string | ArrayBuffer | null>(
      (resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      }
    )
    const body = JSON.stringify({ audio: base64, model: 'whisper-1' })
    const headers = { 'Content-Type': 'application/json' }

    const response = await axios.post('/api/transcribe', body, {
      headers,
    })

    const { text } = await response.data

    if (text) {
      setInput(text);

      return {
        text: text
      };
    }

    return {
      text: ""
    };
  }

  const clearMessages = async () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };


  return (
    <main className="flex flex-col min-h-screen items-center justify-between py-4 px-4 lg:px-0">
      <ChatMessages {...{ messages }} />
      <div className="flex flex-col items-center w-full fixed bottom-0 pb-3 bg-gray-900">
        <ChatControls
          {...{
            audioRef,
            savedAudio,
            messages,
            clearMessages
          }}
        />
        <ChatInput
          {...{
            input,
            setInput,
            loading,
            sendMessage,
            doTranscribe
          }}
        />
      </div>
    </main>
  );
}
