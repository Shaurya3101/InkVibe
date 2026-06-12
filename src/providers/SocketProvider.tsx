"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "react-hot-toast";

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const incrementCount = useNotificationStore((state) => state.incrementCount);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setOnline(false);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      setOnline(true);
      newSocket.emit("join", userId);
    };
    const handleDisconnect = () => setOnline(false);
    const handleNotification = (data: any) => {
      addNotification(data.notification);
      incrementCount();

      let toastMessage = "";
      if (data.type === "like") {
        toastMessage = `${data.notification.user.name} liked your article`;
      } else if (data.type === "comment") {
        toastMessage = `${data.notification.user.name} commented on your article`;
      } else if (data.type === "reply") {
        toastMessage = `${data.notification.user.name} replied to your comment`;
      } else if (data.type === "follow") {
        toastMessage = `${data.notification.user.name} started following you`;
      } else {
        toastMessage = "You have received a new update";
      }

      toast.success(toastMessage, {
        icon: "✨",
        style: {
          borderRadius: "12px",
          background: "#121212",
          color: "#f4f3ef",
          fontFamily: "var(--font-sans)",
          border: "1px solid #c5a880",
        },
      });
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("notification", handleNotification);

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("notification", handleNotification);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id, addNotification, incrementCount]);

  return (
    <SocketContext.Provider value={{ socket, online }}>
      {children}
    </SocketContext.Provider>
  );
};
