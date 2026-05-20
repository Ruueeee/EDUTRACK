import { Announcement } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: (id: string) => void;
}

export function AnnouncementCard({ announcement, onDelete }: AnnouncementCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{announcement.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(announcement.createdAt), "PPP p")}
          </p>
        </div>
        {onDelete && (
          <Button variant="ghost" size="icon" onClick={() => onDelete(announcement.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{announcement.body}</p>
      </CardContent>
    </Card>
  );
}

