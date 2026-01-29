import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <DashboardHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-5 lg:p-8">
                {children}
            </main>
        </div>
    )
}
