import { useQuery } from "@tanstack/react-query";

interface Message {
  _id: string;
  text: string;
}

const fetchMessages = async (): Promise<Message[]> => {
  const response = await fetch("http://localhost:3000/messages");
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
};

function App() {
  const { data, isLoading, error } = useQuery<Message[], Error>({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Messages</h1>
      <ul>
        {(data || []).map((message) => (
          <li key={message._id}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;