import { redirect } from "next/navigation";

import Rail from "@/components/app/rail";
import Tabbar from "@/components/app/tabbar";
import Topbar from "@/components/app/topbar";
import { getSessionUserId } from "@/lib/auth";
import { buildUserView, userAvatarColors, weekActivity } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: pages fetch data client-side, but nobody without a
  // session cookie should ever see the shell. buildUserView returns null for
  // a cookie whose user no longer exists (db:reset wipes accounts). Server
  // Components cannot clear cookies, so stale sessions just bounce to
  // /login; the next login overwrites the cookie, and APIs 401 it meanwhile.
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const me = buildUserView(userId);
  if (!me) redirect("/login");

  return (
    <div className="shell">
      <Rail me={me} avatar={userAvatarColors(userId)} week={weekActivity(userId)} />
      <div className="workspace">
        <Topbar />
        <main className="content" id="main">
          {children}
        </main>
      </div>
      <Tabbar />
    </div>
  );
}
