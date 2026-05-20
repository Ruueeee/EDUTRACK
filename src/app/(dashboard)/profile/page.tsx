import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Name</p>
            <p>{user.name ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Email</p>
            <p>{user.email ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Role</p>
            <p className="uppercase">{user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
