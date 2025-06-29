import { AppSidebar } from "@/components/app/AppSidebar"
import { Header } from "@/components/app/Header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppProvider } from "@/context/AppContext"

export default function AppLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<AppProvider>
			<SidebarProvider>
				<div className="flex h-screen w-full">
					<AppSidebar />
					<SidebarInset className="flex-1 flex flex-col">
						<Header />
						<main className="flex-1 overflow-y-auto p-6">
							{children}
						</main>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</AppProvider>
	)
}