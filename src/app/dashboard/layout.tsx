import { PanelShell } from "@/components/panel/PanelShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
