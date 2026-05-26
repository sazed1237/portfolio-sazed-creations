export const metadata = {
  title: 'Admin',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
