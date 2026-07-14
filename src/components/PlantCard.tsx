import Image from "next/image";
import Link from "next/link";

interface PlantCardProps {
  id: string;
  title: string;
  short: string;
  price: number;
  image: string;
  onClick?: () => void;
}

export default function PlantCard({ id, title, short, price, image, onClick }: PlantCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      href={`/explore?plantId=${id}`}
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-forest/30 active:scale-[0.99] cursor-pointer select-none"
    >
      <div className="relative h-60 w-full overflow-hidden bg-cream">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-forest-dark group-hover:text-forest transition-colors">
            {title}
          </h3>
          <p className="text-xs text-forest/70 line-clamp-2 leading-relaxed">
            {short}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2 mt-auto">
          <span className="text-base font-extrabold text-forest">${price.toFixed(2)}</span>
          <span className="rounded-lg bg-forest/5 px-3 py-1.5 text-xs font-semibold text-forest transition-all duration-200 group-hover:bg-forest group-hover:text-white">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
