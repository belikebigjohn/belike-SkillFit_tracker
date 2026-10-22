import Rail from "@/components/app/rail";
import Tabbar from "@/components/app/tabbar";
import Topbar from "@/components/app/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Rail />
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
