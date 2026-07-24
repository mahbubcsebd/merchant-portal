import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export const metadata = {
  title: "Dashboard — mPay Network",
  description: "Merchant Portal Dashboard",
}

export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
