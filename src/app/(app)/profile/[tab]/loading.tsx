export default function ProfileTabLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="col-span-2 h-24 rounded-2xl bg-white/5 sm:col-span-1" />
      </div>
    </div>
  );
}
