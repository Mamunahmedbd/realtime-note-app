import { NoteEditor } from "@/components/notes-editor";
import { UserHeader } from "@/components/user-header";
import { ActiveUsers } from "@/components/active-users";
import { NotesList } from "@/components/notes-list";

export default async function Home() {
  // const session = await getServerSession(authOptions)

  // if (!session) {
  //   redirect("/login")
  // }

  return (
    <main className="container mx-auto px-4 py-6">
      <UserHeader user={{ id: "1", name: "John Doe", email: "john@doe.com" }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <NotesList />
            <ActiveUsers />
          </div>
        </div>
        <div className="md:col-span-2">
          <NoteEditor />
        </div>
      </div>
    </main>
  );
}
