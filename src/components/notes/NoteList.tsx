"use client";

import { SelfNote } from "@prisma/client";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: SelfNote[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  isLoading?: boolean;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  isLoading,
}: NoteListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">My Notes</h2>
        <Button variant="ghost" size="icon" onClick={onCreateNote} className="rounded-full">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notes yet. Create one to get started!
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={cn(
                "group cursor-pointer border-b p-4 transition-colors hover:bg-muted/50",
                selectedNoteId === note.id && "bg-muted shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold line-clamp-1 flex-1">
                  {note.title || "Untitled Note"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {note.body || "No content"}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                {format(new Date(note.updatedAt), "PPP")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
