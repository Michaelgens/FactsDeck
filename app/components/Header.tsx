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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-950/95 dark:bg-gradient-to-r dark:from-dark-950/95 dark:to-dark-850/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-amber-600 dark:from-purple-600 dark:via-amber-600 dark:to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">FD</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white dark:bg-gradient-to-r dark:from-white dark:to-purple-200 dark:bg-clip-text dark:text-transparent">
              Facts Deck
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
                      className="flex items-center text-slate-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-emerald-400 font-medium transition-colors p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-emerald-900/20"
                    >
                      {item.name}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === item.name && item.dropdownItems && (
                      <div
                        ref={(el) => {
                          dropdownRefs.current[item.name] = el;
                        }}
                        className="absolute top-full left-0 pt-2 z-50"
                      >
                        <div className="w-72 bg-white dark:bg-dark-900/95 dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-850/50 rounded-xl shadow-xl border border-slate-200 dark:border-purple-500/50 py-2">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2.5 text-sm text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-emerald-900/20 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors group/item"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="font-medium block group-hover/item:text-purple-600 dark:group-hover/item:text-emerald-400">{dropdownItem.name}</span>
                            {"subtitle" in dropdownItem && dropdownItem.subtitle && (
                              <span className="text-xs text-slate-500 dark:text-purple-400 mt-0.5 block">{dropdownItem.subtitle}</span>
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
                    className={`font-medium p-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30"
                        : "text-slate-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-emerald-400 hover:bg-purple-50 dark:hover:bg-emerald-900/20"
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
                className="p-2 text-slate-500 dark:text-purple-300 hover:text-purple-600 dark:hover:text-emerald-400 hover:bg-purple-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              {isSearchOpen && (
                <form onSubmit={handleSearch} className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-900/95 dark:border-purple-500/50 rounded-xl shadow-xl border border-slate-200 p-4">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Articles, topics & tools..."
                    className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
                    autoFocus
                  />
                  {matchingTools.length > 0 && (
                    <div className="mt-3 rounded-lg border border-slate-200 dark:border-purple-500/40 divide-y divide-slate-100 dark:divide-purple-500/20 overflow-hidden">
                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-purple-400 flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5" aria-hidden />
                        Tools
                      </p>
                      {matchingTools.map((t) => (
                        <Link
                          key={t.slug}
                          href={`/tools/${t.slug}`}
                          className="block px-3 py-2.5 text-sm text-slate-800 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-emerald-900/20 transition-colors"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <span className="font-medium">{t.name}</span>
                          <span className="block text-xs text-slate-500 dark:text-purple-400 mt-0.5 line-clamp-1">{t.tagline}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mt-3 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
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
                className="flex items-center p-2 text-slate-500 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 hover:bg-purple-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              >
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-sm">{currentLanguage.flag}</span>
              </button>
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900/95 dark:border-purple-500/50 rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-emerald-900/20 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors"
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
              className="p-2 text-slate-500 dark:text-purple-300 hover:text-purple-600 dark:hover:text-emerald-400 hover:bg-purple-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 hover:bg-purple-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-500 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 hover:bg-purple-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-dark-950 dark:border-purple-500/30 border-t border-slate-200">
          <form onSubmit={handleSearch} className="px-4 py-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Articles, topics & tools..."
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
            {matchingTools.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-purple-500/40 divide-y divide-slate-100 dark:divide-purple-500/20 overflow-hidden">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-purple-400 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" aria-hidden />
                  Matching tools
                </p>
                {matchingTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="block px-3 py-2.5 text-sm text-slate-800 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-emerald-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="block text-xs text-slate-500 dark:text-purple-400 mt-0.5">{t.tagline}</span>
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
                      className="flex items-center justify-between w-full text-slate-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-emerald-400 font-medium py-2 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-emerald-900/20"
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
                          className="block ml-4 py-2.5 text-slate-600 dark:text-purple-300 hover:text-purple-600 dark:hover:text-emerald-400"
                          onClick={() => {
                            setActiveDropdown(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          <span className="font-medium">{dropdownItem.name}</span>
                          {"subtitle" in dropdownItem && dropdownItem.subtitle && (
                            <span className="block text-xs text-slate-500 dark:text-purple-400 mt-0.5">{dropdownItem.subtitle}</span>
                          )}
                        </Link>
                      ))}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block text-slate-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-emerald-400 font-medium py-2 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-emerald-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            </div>
            {/* Mobile language row — restore with languages + Globe when adding i18n
            <div className="pt-4 border-t border-slate-200 dark:border-purple-500/30">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-slate-500 dark:text-purple-400" />
                <span className="text-slate-700 dark:text-purple-200">{currentLanguage.name}</span>
              </div>
            </div>
            */}
          </form>
        </div>
      )}
    </header>
  );
}
