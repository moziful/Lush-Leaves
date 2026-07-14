import Link from "next/link";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHeart,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full border-t border-sage/15 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-forest">
                Lush<span className="text-sage">Leaves</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Curating premium, healthy indoor plants to breathe life, style, and fresh air into your home.
            </p>
            <div className="flex items-center gap-2.5">
              {[FiFacebook, FiInstagram, FiTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10 text-forest/60 hover:bg-forest hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-forest-dark/40 mb-5">
              Shop
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "All Plants", href: "/explore" },
                { label: "Foliage", href: "/explore?category=Foliage" },
                { label: "Succulents", href: "/explore?category=Succulent" },
                { label: "Air Purifiers", href: "/explore?category=Air+Purifier" },
                { label: "Flowering", href: "/explore?category=Flowering" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-forest transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-forest-dark/40 mb-5">
              Information
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Our Story", href: "/about" },
                { label: "Plant Care Guide", href: "/care-guide" },
                { label: "Explore Catalog", href: "/explore" },
                { label: "Shipping & Returns", href: "#" },
                { label: "FAQ & Support", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-forest transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-forest-dark/40 mb-5">
              Get in Touch
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <FiMail className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <span className="text-slate-500">hello@lushleaves.com</span>
              </li>
              <li className="flex items-start gap-3">
                <FiPhone className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <span className="text-slate-500">+1 (555) 345-6789</span>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <span className="text-slate-500 leading-snug">
                  123 Greenhouse Lane,<br />Leafy Green, OR 97401
                </span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-sage/15 my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} LushLeaves. Made with{" "}
            <FiHeart className="text-forest h-3 w-3" /> for plant lovers.
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-forest transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-forest transition-colors">Terms of Service</a>
          </div>
          <p>
            Developed by{" "}
            <Link
              href="http://moziful.vercel.app/"
              target="_blank"
              className="text-sky-400 font-semibold leading-loose uppercase text-xs bg-sky-100/20 rounded-sm px-1"
            >
              Moziful Haque
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
