"use client";

import { useEffect, useState } from "react";
import { SelfNote } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { NoteSchema } from "@/lib/validators/note";
import { z } from "zod";

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<SelfNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SelfNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/notes");
        if (response.ok) {
          const data = await response.json();
          setNotes(data.data);
        } else {
          toast.error("Failed to load notes.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching notes.");
      }
      setIsLoading(false);
    };
    fetchNotes();
  }, []);

  const handleSelectNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    setSelectedNote(note || null);
  };

  const handleCreateNote = async () => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Note", body: "" }),
      });
      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote.data, ...notes]);
        setSelectedNote(newNote.data);
        toast.success("New note created.");
      } else {
        toast.error("Failed to create note.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the note.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== id));
        if (selectedNote?.id === id) {
          setSelectedNote(null);
        }
        toast.success("Note deleted.");
      } else {
        toast.error("Failed to delete note.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the note.");
    }
  };

  const handleSaveNote = async (id: string, values: z.infer<typeof NoteSchema>) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map((n) => (n.id === id ? updatedNote.data : n)));
        // Update selected note to reflect changes in the editor if it's the one we saved
        if (selectedNote?.id === id) {
          setSelectedNote(updatedNote.data);
        }
      } else {
        toast.error("Failed to save note.");
      }
    } catch (error) {
      toast.error("An error occurred while saving the note.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-6">
      <PageHeader
        title="Self-Notes"
        description="Your private space for thoughts and reminders."
      />
      <div className="flex-1 overflow-hidden rounded-lg border bg-card">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={30} minSize={20} className="bg-muted/10">
            <NoteList
              notes={notes}
              selectedNoteId={selectedNote?.id || null}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              isLoading={isLoading}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
