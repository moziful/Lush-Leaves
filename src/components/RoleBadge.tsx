interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const isColor =
    role === "admin"
      ? "bg-forest/10 text-forest border-forest/20"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isColor}`}
    >
      {role === "user" ? "reader" : role}
    </span>
  );
}
