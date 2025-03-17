"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSocket } from "./socket-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, FileText, Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";
import { CreateNote } from "./create-note";
import { toast } from "sonner";

export function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Fetch initial notes
    socket.emit("fetchNotes", { page: 1, limit: 10 });

    // Handle received notes
    const handleGetNotes = (response: { notes: Note[] }) => {
      console.log(response);
      setNotes(response.notes);
      setIsLoading(false);

      if (response.notes.length > 0) {
        setSelectedNoteId(response.notes[0]._id);
        socket.emit("selectNote", { noteId: response.notes[0]._id });
      }
    };

    // Listen for notes update
    socket.on("getNotes", handleGetNotes);

    // Listen for note updates
    socket.on("noteCreated", (note) => {
      setNotes((prev) => [note, ...prev]);
      // toast.success(`"${note.name}" has been created`);
    });

    socket.on("noteUpdated", (updatedNote) => {
      setNotes((prev) =>
        prev.map((note) => (note._id === updatedNote._id ? updatedNote : note))
      );
    });

    return () => {
      socket.off("getNotes", handleGetNotes);
      socket.off("noteCreated");
      socket.off("noteUpdated");
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("noteDeleted", (noteId) => {
      setNotes((prev) => {
        const updatedNotes = prev.filter((note) => note._id !== noteId);

        console.log({ updatedNotes, selectedNoteId, noteId });

        if (selectedNoteId === noteId) {
          if (updatedNotes.length > 0) {
            console.log(updatedNotes);
            setSelectedNoteId(updatedNotes[0]._id);
            socket.emit("selectNote", { noteId: updatedNotes[0]._id });
          } else {
            setSelectedNoteId(null);
          }
        }

        return updatedNotes;
      });

      toast.success("Note deleted");
    });

    return () => {
      socket.off("noteDeleted");
    };
  }, [socket, isConnected, selectedNoteId]);

  const selectNote = (noteId: string) => {
    if (!socket || !isConnected) return;

    setSelectedNoteId(noteId);
    socket.emit("selectNote", { noteId });
  };

  const deleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!socket || !isConnected) return;

    socket.emit("deleteNote", { noteId });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Notes</h2>
          <Button size="sm" disabled>
            <PlusCircle className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notes</h2>
        <CreateNote />
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No notes yet</p>
          <p className="text-sm">Create your first note to get started</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2 pr-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  selectedNoteId === note._id ? "bg-muted" : ""
                }`}
                onClick={() => selectNote(note._id)}
              >
                <div className="truncate">
                  <p className="font-medium truncate">
                    {note.name || "Untitled Note"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => deleteNote(e, note._id)}
                  className="cursor-pointer text-red-400 group-hover:text-red-600 hover:text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
