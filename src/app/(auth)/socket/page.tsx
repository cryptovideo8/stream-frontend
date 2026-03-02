'use client';
import { useEffect, useState } from "react";
import { getSocket } from "../../utils/socket";

const SOCKET_ID = "1234"; // hardcoded for testing

export default function SocketTestPage() {
  const [socketId, setSocketId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const socket = getSocket();

  //   socket.on("connect", () => {
  //     setConnected(true);
  //     setSocketId(socket.id);
  //     console.log("✅ Connected to backend socket server");
  //     console.log("Client Socket ID:", socket.id);

  //     // Join the test room
  //     socket.emit("join", SOCKET_ID);
  //   });

  //   socket.on("upload-progress", (data) => {
  //     console.log("📶 Progress event:", data);
  //     setProgress(`${data.percentage}%`);
  //   });

  //   socket.on("upload-complete", (data) => {
  //     console.log("✅ Complete event:", data);
  //   //   setCompleteMessage(`Upload complete! URL: ${data.playbackUrl}`);
  //   });

  //   socket.on("upload-error", (data) => {
  //     console.error("❌ Error event:", data);
  //   //   setError(data.error);
  //   });

  //   socket.on("disconnect", () => {
  //     setConnected(false);
  //     console.log("❌ Disconnected from socket server");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Socket Test Page</h1>
{/* 
      <p>Status: {connected ? "🟢 Connected" : "🔴 Not connected"}</p>
      <p>Socket ID: {socketId}</p>

      {progress && <p className="text-blue-500">Progress: {progress}</p>}
      {completeMessage && <p className="text-green-600">{completeMessage}</p>}
      {error && <p className="text-red-500">Error: {error}</p>} */}
    </div>
  );
}
