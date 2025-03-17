"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSocket } from "./socket-provider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/lib/types";
import { debounce } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

export function NoteEditor() {
  const [currentNote, setCurrentNote] = useState<Note | null>({} as Note);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  // Debounced update functions
  const updateTitle = debounce((value: string) => {
    if (!socket || !isConnected || !currentNote) return;

    socket.emit("updateNoteTitle", {
      noteId: currentNote._id,
      title: value,
    });
  }, 500);

  const updateContent = debounce((value: string) => {
    if (!socket || !isConnected || !currentNote) return;

    socket.emit("updateNoteContent", {
      noteId: currentNote._id,
      content: value,
    });
  }, 500);

  // Handle title change (Local update first)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateTitle(newTitle);
  };

  // Handle content change (Local update first)
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateContent(newContent);
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for note selection
    socket.on("noteSelected", (note: Note) => {
      setCurrentNote(note);
      setTitle(note.name);
      setContent(note.content);
      setIsLoading(false);
    });

    const handleContentUpdate = (data: { noteId: string; content: string }) => {
      if (currentNote && currentNote._id === data.noteId) {
        setContent((prevContent) => {
          if (prevContent !== data.content) {
            return data.content; // Only update if it's different
          }
          return prevContent;
        });
      }
    };

    const handleTitleUpdate = (data: { noteId: string; title: string }) => {
      if (currentNote && currentNote._id === data.noteId) {
        setTitle((prevTitle) => {
          if (prevTitle !== data.title) {
            return data.title; // Only update if it's different
          }
          return prevTitle;
        });
      }
    };

    socket.on("noteContentUpdated", handleContentUpdate);
    socket.on("noteTitleUpdated", handleTitleUpdate);

    return () => {
      socket.off("noteSelected");
      socket.off("noteContentUpdated", handleContentUpdate);
      socket.off("noteTitleUpdated", handleTitleUpdate);
    };
  }, [socket, isConnected, currentNote]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[60vh] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!currentNote) {
    return (
      <Card className="h-[70vh] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <p>No note selected</p>
          <p className="text-sm">
            Select a note from the list or create a new one
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="text-xl font-bold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your note here..."
            className="min-h-[60vh] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
