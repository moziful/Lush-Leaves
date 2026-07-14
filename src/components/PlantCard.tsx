import Image from "next/image";
import Link from "next/link";

interface PlantCardProps {
  id: string;
  title: string;
  short: string;
  price: number;
  image: string;
}

export default function PlantCard({ id, title, short, price, image }: PlantCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative h-60 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-103"
        />
      </div>
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{short}</p>
        </div>
        <div className="flex items-center justify-between pt-2 mt-auto">
          <span className="text-base font-extrabold text-forest">${price.toFixed(2)}</span>
          <Link
            href={`/explore?search=${encodeURIComponent(title)}`}
            className="rounded-lg bg-forest/5 px-3 py-1.5 text-xs font-semibold text-forest transition-all hover:bg-forest hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
