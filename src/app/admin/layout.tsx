export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin layout: sidebar + main content */}
      {/* Sidebar: Dashboard, Help Points, QR Scan Logs, Assistance Requests, Reports, Settings */}
      {/* Quick Actions: Add Help Point, Update Information, Broadcast Message */}
      {children}
    </div>
  );
}
