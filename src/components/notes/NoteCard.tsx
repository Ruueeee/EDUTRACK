import { SelfNote } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

interface SelfNoteCardProps {
  note: SelfNote;
  onClick: () => void;
  isActive: boolean;
}

export function SelfNoteCard({ note, onClick, isActive }: SelfNoteCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${isActive ? "bg-muted" : "hover:bg-muted/50"
        }`}
    >
      <h3 className="font-semibold truncate">{note.title}</h3>
      <p className="text-sm text-muted-foreground truncate">
        {note.body.substring(0, 100)}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        {format(new Date(note.updatedAt), "PPP")}
      </p>
    </button>
  );
}

