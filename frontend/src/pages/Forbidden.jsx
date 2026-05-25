export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-16">
      <h1 className="text-4xl font-bold text-red-600">403 Forbidden</h1>
      <p className="mt-4 text-gray-600">You do not have permission to access this page.</p>
    </div>
  );
}
