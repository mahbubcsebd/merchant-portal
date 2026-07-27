import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard/DashboardLayout";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <DashboardLayoutComponent>
      <Outlet />
    </DashboardLayoutComponent>
  );
}
