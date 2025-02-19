import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Message {
  _id: string;
  text: string;
}

const fetchMessages = async (): Promise<Message[]> => {
  const response = await fetch("http://localhost:3001/messages");
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
};

const postMessage = async (text: string): Promise<Message> => {
  const response = await fetch("http://localhost:3001/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error("Failed to post message");
  }
  return response.json();
};

function App() {
  const [inputText, setInputText] = useState("");

  const { data, isLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  const mutation = useMutation({
    mutationFn: postMessage,
    onSuccess: () => {
      refetch();
      setInputText("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      mutation.mutate(inputText);
    }
  };

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>Messages</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending..." : "Send"}
        </button>
      </form>
      <ul>
        {(data || []).map((message) => (
          <li key={message._id}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;