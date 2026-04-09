"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, ChevronDown, Sun, Moon, Wrench } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { siteTools } from "../lib/site-config";
import { pickDailyTools, toolMatchesSearch } from "../lib/tools-utils";

type NavDropdownItem = { name: string; href: string; subtitle: string };

type NavItem = {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: NavDropdownItem[];
};

const navigationItemsBase: NavItem[] = [
  {
    name: "Learn",
    href: "/post",
    hasDropdown: true,
    dropdownItems: [
      { name: "Comparisons", href: "/post?type=featured", subtitle: "Expert comparisons" },
      { name: "Guides", href: "/post?type=guides", subtitle: "Popular guides" },
      { name: "Education", href: "/post?type=expert-picks", subtitle: "Expert insights" },
      { name: "Browse all articles", href: "/post", subtitle: "Latest & more" },
    ],
  },
  {
    name: "Topics",
    href: "/post",
    hasDropdown: true,
    dropdownItems: [
      { name: "Personal Finance", href: "/post?category=Personal Finance", subtitle: "Budgeting, savings & more" },
      { name: "Banking", href: "/post?category=Banking", subtitle: "Accounts & services" },
      { name: "Investing", href: "/post?category=Investing", subtitle: "Stocks, funds & markets" },
      { name: "Real Estate", href: "/post?category=Real Estate", subtitle: "Property & REITs" },
      { name: "Cryptocurrency", href: "/post?category=Cryptocurrency", subtitle: "Crypto & blockchain" },
      { name: "Retirement", href: "/post?category=Retirement", subtitle: "Wealth & planning" },
      { name: "Explore all topics", href: "/post", subtitle: "See everything" },
    ],
  },
];

// Multi-language: uncomment when adding i18n
// const languages = [
//   { code: "en", name: "English", flag: "🇺🇸" },
//   { code: "fr", name: "Français", flag: "🇫🇷" },
//   { code: "de", name: "Deutsch", flag: "🇩🇪" },
//   { code: "es", name: "Español", flag: "🇪🇸" },
//   { code: "it", name: "Italiano", flag: "🇮🇹" },
//   { code: "pt", name: "Português", flag: "🇵🇹" },
//   { code: "sv", name: "Svenska", flag: "🇸🇪" },
//   { code: "da", name: "Dansk", flag: "🇩🇰" },
//   { code: "no", name: "Norsk", flag: "🇳🇴" },
//   { code: "nl", name: "Nederlands", flag: "🇳🇱" },
// ];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  // const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  // const languageDropdownRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isSearchOpen && searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (activeDropdown) {
        const ref = dropdownRefs.current[activeDropdown];
        if (ref && !ref.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    }
    if (activeDropdown || isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, isSearchOpen]);

  const handleDropdownToggle = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const matchingTools = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return [];
    return siteTools.filter((t) => toolMatchesSearch(t, q)).slice(0, 5);
  }, [searchQuery]);

  const navigationItems = useMemo(() => {
    const picked = pickDailyTools(siteTools, 3, "nav-tools-spotlight");
    const toolsDropdown: NavDropdownItem[] = [
      ...picked.map((t) => ({
        name: t.name,
        href: `/tools/${t.slug}`,
        subtitle: t.tagline,
      })),
      { name: "View all tools", href: "/tools", subtitle: "Calculators & simulators" },
    ];
    const items: NavItem[] = [
      { name: "Home", href: "/" },
      { name: "Tools", href: "/tools", hasDropdown: true, dropdownItems: toolsDropdown },
      ...navigationItemsBase,
    ];
    return items;
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/post?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Facts Deck Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-blue-700 dark:text-emerald-400">Facts</span>{" "}
              <span className="text-orange-600 dark:text-cyan-400">Deck</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDropdownToggle(item.name)}
                      className={`flex items-center rounded-lg p-2 font-medium text-zinc-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-emerald-950/55 dark:hover:text-cyan-300 ${
                        activeDropdown === item.name
                          ? "text-blue-800 dark:text-cyan-300"
                          : ""
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 shrink-0 transition-transform text-zinc-500 dark:text-zinc-400 ${
                          activeDropdown === item.name
                            ? "rotate-180 text-orange-600 dark:text-emerald-400"
                            : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === item.name && item.dropdownItems && (
                      <div
                        ref={(el) => {
                          dropdownRefs.current[item.name] = el;
                        }}
                        className="absolute top-full left-0 pt-2 z-[70]"
                      >
                        <div className="w-72 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="group/item block px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-200"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="block font-medium group-hover/item:text-blue-900 dark:group-hover/item:text-cyan-100">{dropdownItem.name}</span>
                            {"subtitle" in dropdownItem && dropdownItem.subtitle && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 block">{dropdownItem.subtitle}</span>
                            )}
                          </Link>
                        ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`rounded-lg p-2 font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : "text-zinc-700 hover:bg-blue-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-2">
            <div className="relative" ref={searchBarRef}>
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-300 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
              >
                <Search className="h-5 w-5" />
              </button>
              {isSearchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 z-[70] mt-2 w-96 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Articles, topics & tools..."
                    className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25"
                    autoFocus
                  />
                  {matchingTools.length > 0 && (
                    <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                      <p className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-400">
                        <Wrench className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" aria-hidden />
                        Tools
                      </p>
                      {matchingTools.map((t) => (
                        <Link
                          key={t.slug}
                          href={`/tools/${t.slug}`}
                          className="block px-3 py-2.5 text-sm text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <span className="font-medium">{t.name}</span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{t.tagline}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                  >
                    Search articles
                  </button>
            
                </form>
              )}
            </div>

            {/* Language selector — restore with languages[] + Globe import when adding i18n
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center p-2 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 rounded-lg transition-colors"
              >
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-sm">{currentLanguage.flag}</span>
              </button>
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            */}

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-300 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-300 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-300 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
            >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSearch} className="px-4 py-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Articles, topics & tools..."
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Search
              </button>
            </div>
            {matchingTools.length > 0 && (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                <p className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-cyan-400">
                  <Wrench className="h-3.5 w-3.5 text-blue-600 dark:text-emerald-400" aria-hidden />
                  Matching tools
                </p>
                {matchingTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="block px-3 py-2.5 text-sm text-zinc-800 transition-colors hover:bg-orange-50 hover:text-blue-900 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.tagline}</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="space-y-4">
            {navigationItems.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(item.name)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 font-medium text-zinc-700 transition-colors hover:bg-orange-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === item.name &&
                      item.dropdownItems?.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="ml-4 block py-2.5 text-zinc-600 transition-colors hover:text-blue-800 dark:text-zinc-300 dark:hover:text-cyan-200"
                          onClick={() => {
                            setActiveDropdown(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          <span className="font-medium">{dropdownItem.name}</span>
                          {"subtitle" in dropdownItem && dropdownItem.subtitle && (
                            <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{dropdownItem.subtitle}</span>
                          )}
                        </Link>
                      ))}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-2 py-2 font-medium text-zinc-700 transition-colors hover:bg-orange-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            </div>
            {/* Mobile language row — restore with languages + Globe when adding i18n
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-zinc-500 dark:text-zinc-300" />
                <span className="text-zinc-700 dark:text-zinc-200">{currentLanguage.name}</span>
              </div>
            </div>
            */}
          </form>
        </div>
      )}
    </header>
  );
}
