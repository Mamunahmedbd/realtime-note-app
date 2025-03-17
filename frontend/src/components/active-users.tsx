"use client";

import { useState, useEffect } from "react";
import { useSocket } from "./socket-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";
import api from "@/lib/axiosInstance";

export function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    api.get(`${process.env.NEXT_PUBLIC_API_RESOURCE}/auth/me`).then((res) => {
      socket.emit("join", res.data);
    });

    socket.on("activeUsers", setActiveUsers);
    socket.on("userJoined", (user) => {
      setActiveUsers((prev) => [...prev, user]);
    });

    socket.on("userLeft", (userId) => {
      setActiveUsers((prev) => prev.filter((user) => user.id !== userId));
    });

    return () => {
      socket.off("activeUsers");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [socket, isConnected]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium mb-2">Active Users</h3>
      <div className="flex flex-wrap gap-2">
        {activeUsers.map((user) => (
          <Badge
            key={user.id}
            variant="outline"
            className="flex items-center gap-1 py-1 px-2"
          >
            <span className="relative">
              <Avatar className="h-6 w-6">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name || "User"} />
                ) : (
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                )}
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-background"></span>
            </span>
            <span className="text-xs">{user.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
