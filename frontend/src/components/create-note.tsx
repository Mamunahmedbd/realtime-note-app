import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useSocket } from "./socket-provider";
import { useState } from "react";
import { toast } from "sonner";

export function CreateNote() {
  const { socket, isConnected } = useSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    title: "",
    content: "",
  });
  const [open, setOpen] = useState(false);

  const onCreateNote = () => {
    if (!socket || !isConnected) return;

    setIsLoading(true);

    socket.emit("createNote", {
      title: data.title,
      content: data.content,
      userId: "67d704f96562d9cd5fdfb32e",
    });

    // Listen for success response
    socket.once("noteCreated", (note) => {
      setIsLoading(false);
      toast.success(`"${note.name}" has been created`);
      setData({ title: "", content: "" }); // Reset form
      setOpen(false); // Close dialog
    });

    // Handle errors
    socket.once("error", (err) => {
      setIsLoading(false);
      toast.error(err.message || "Failed to create note");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription>
            Create a new note to get started
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              placeholder="New Note"
              className="col-span-3"
              onChange={(e) => setData({ ...data, title: e.target.value })}
              value={data.title}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea
              placeholder="This is a note"
              className="col-span-3"
              onChange={(e) => setData({ ...data, content: e.target.value })}
              value={data.content}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="cursor-pointer"
            type="submit"
            onClick={onCreateNote}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
