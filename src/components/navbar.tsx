"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import {
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Mail,
  Cloud,
  Bug,
  FlaskConical,
  Leaf,
  Heart,
  ShoppingCart,
  Sprout,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  PieChart,
  TrendingUp,
  BookOpen,
  TreePine,
  MessageCircle,
  FileText,
} from "lucide-react";

type Role = "admin" | "farmer" | "";

export default function Navbar() {
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("");
  const [loading, setLoading] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"tools" | "learn" | "role" | "user" | null>(null);

  const toolsRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios
      .get("/api/users/me", { headers: { "Cache-Control": "no-store" }, withCredentials: true })
      .then((res) => {
        setIsAuthenticated(!!res.data.authenticated);
        setUsername(res.data.user?.username || "");
        setRole((res.data.user?.role as Role) || "");
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUsername("");
        setRole("");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (toolsRef.current && !toolsRef.current.contains(t) && openMenu === "tools") setOpenMenu(null);
      if (learnRef.current && !learnRef.current.contains(t) && openMenu === "learn") setOpenMenu(null);
      if (roleRef.current && !roleRef.current.contains(t) && openMenu === "role") setOpenMenu(null);
      if (userRef.current && !userRef.current.contains(t) && openMenu === "user") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenu]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (loading) {
    return <div className="h-[64px] border-b border-stone-200 bg-white sticky top-0 z-50" />;
  }

  return (
    <motion.nav
      className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 w-full"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image
            src="/nature/logo.jpg"
            alt="AgriBloom"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-base font-semibold text-stone-900 tracking-tight hidden sm:inline">
            AgriBloom
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/mandi-prices" active={isActive("/mandi-prices")}>
            Mandi prices
          </NavLink>
          <NavLink href="/agrilens" active={isActive("/agrilens") || isActive("/crops")}>
            Crops
          </NavLink>
          <NavLink href="/schemes" active={isActive("/schemes")}>
            Schemes
          </NavLink>

          {isAuthenticated && (
            <NavLink href="/chat" active={isActive("/chat")}>
              Assistant
            </NavLink>
          )}

          {/* Tools dropdown */}
          {isAuthenticated && (
            <Dropdown
              ref={toolsRef}
              label="Tools"
              open={openMenu === "tools"}
              onToggle={() => setOpenMenu(openMenu === "tools" ? null : "tools")}
              active={["/insect", "/pests", "/fertilizer", "/weather", "/healthandbenefits"].some(isActive)}
            >
              <DropdownItem href="/insect" icon={<Bug className="h-4 w-4" />} title="Pests & diseases" subtitle="Identify and treat" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/fertilizer" icon={<FlaskConical className="h-4 w-4" />} title="Fertilizer" subtitle="NPK & dose schedule" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/weather" icon={<Cloud className="h-4 w-4" />} title="Weather" subtitle="Forecast + alerts" iconBg="bg-blue-50" iconColor="text-blue-700" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/healthandbenefits" icon={<Heart className="h-4 w-4" />} title="Health & nutrition" subtitle="Crop nutrition values" iconBg="bg-rose-50" iconColor="text-rose-700" onClick={() => setOpenMenu(null)} />
            </Dropdown>
          )}

          {/* Learn dropdown */}
          {isAuthenticated && (
            <Dropdown
              ref={learnRef}
              label="Learn"
              open={openMenu === "learn"}
              onToggle={() => setOpenMenu(openMenu === "learn" ? null : "learn")}
              active={["/soil", "/biofertilizers", "/farmingtechniques", "/trees"].some(isActive)}
            >
              <DropdownItem href="/soil" icon={<BookOpen className="h-4 w-4" />} title="Soil types" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/biofertilizers" icon={<Leaf className="h-4 w-4" />} title="Biofertilizers" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/farmingtechniques" icon={<Sprout className="h-4 w-4" />} title="Farming techniques" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/trees" icon={<TreePine className="h-4 w-4" />} title="Trees & plants" onClick={() => setOpenMenu(null)} />
            </Dropdown>
          )}

          {/* Role dropdown */}
          {isAuthenticated && role === "admin" && (
            <Dropdown
              ref={roleRef}
              label="Admin"
              open={openMenu === "role"}
              onToggle={() => setOpenMenu(openMenu === "role" ? null : "role")}
              active={isActive("/admin")}
            >
              <DropdownItem href="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} title="Dashboard" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/admin/analysis" icon={<BarChart3 className="h-4 w-4" />} title="Crop entries" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/admin/health" icon={<ShieldCheck className="h-4 w-4" />} title="System health" iconBg="bg-blue-50" iconColor="text-blue-700" onClick={() => setOpenMenu(null)} />
            </Dropdown>
          )}

          {isAuthenticated && role === "farmer" && (
            <Dropdown
              ref={roleRef}
              label="My farm"
              open={openMenu === "role"}
              onToggle={() => setOpenMenu(openMenu === "role" ? null : "role")}
              active={isActive("/farmer")}
            >
              <DropdownItem href="/farmer/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} title="Dashboard" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/farmer/crop-entry" icon={<ClipboardList className="h-4 w-4" />} title="Log a crop" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/farmer/trends" icon={<TrendingUp className="h-4 w-4" />} title="Trends" onClick={() => setOpenMenu(null)} />
              <DropdownItem href="/weather" icon={<Cloud className="h-4 w-4" />} title="My weather" iconBg="bg-blue-50" iconColor="text-blue-700" onClick={() => setOpenMenu(null)} />
            </Dropdown>
          )}
        </div>

        {/* User pill on far right */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <div className="hidden lg:block relative" ref={userRef}>
              <button
                onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-full pl-2 pr-3 py-1.5 transition-colors"
                aria-label="Account menu"
              >
                <span className="bg-stone-900 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
                  {(username || "U").charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium max-w-[100px] truncate">{username || "User"}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === "user" ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openMenu === "user" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 bg-white p-2 rounded-xl shadow-lg z-50 min-w-[220px] border border-stone-200"
                  >
                    <div className="px-2 py-2 border-b border-stone-100 mb-1">
                      <p className="font-medium text-stone-900 text-sm truncate">{username}</p>
                      <p className="text-xs text-stone-500 capitalize">{role}</p>
                    </div>
                    <DropdownItem href="/profile" icon={<User className="h-4 w-4" />} title="Profile" onClick={() => setOpenMenu(null)} />
                    <DropdownItem href="/contactus" icon={<Mail className="h-4 w-4" />} title="Contact us" onClick={() => setOpenMenu(null)} />
                    <div className="border-t border-stone-100 my-1" />
                    <Link
                      href="/logout"
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <span className="bg-red-50 text-red-600 p-1.5 rounded-md">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-red-700">Sign out</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-stone-700 hover:text-stone-900 px-3 py-2 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-full px-4 py-2 transition-colors"
              >
                Get started
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-md hover:bg-stone-100 text-stone-900"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-stone-200 bg-white overflow-hidden"
          >
            <div className="px-3 py-3 max-h-[80vh] overflow-y-auto space-y-0.5">
              <MobileLink href="/" icon={<LayoutDashboard className="h-4 w-4" />} title="Home" />
              <MobileLink href="/mandi-prices" icon={<ShoppingCart className="h-4 w-4" />} title="Mandi prices" />
              <MobileLink href="/agrilens" icon={<Sprout className="h-4 w-4" />} title="Crops" />
              <MobileLink href="/schemes" icon={<FileText className="h-4 w-4" />} title="Schemes" />

              {isAuthenticated && (
                <>
                  <MobileLink href="/chat" icon={<MessageCircle className="h-4 w-4" />} title="Assistant" />

                  <Section>Tools</Section>
                  <MobileLink href="/insect" icon={<Bug className="h-4 w-4" />} title="Pests & diseases" />
                  <MobileLink href="/fertilizer" icon={<FlaskConical className="h-4 w-4" />} title="Fertilizer" />
                  <MobileLink href="/weather" icon={<Cloud className="h-4 w-4" />} title="Weather" />
                  <MobileLink href="/healthandbenefits" icon={<Heart className="h-4 w-4" />} title="Health & nutrition" />

                  <Section>Learn</Section>
                  <MobileLink href="/soil" icon={<BookOpen className="h-4 w-4" />} title="Soil types" />
                  <MobileLink href="/biofertilizers" icon={<Leaf className="h-4 w-4" />} title="Biofertilizers" />
                  <MobileLink href="/farmingtechniques" icon={<Sprout className="h-4 w-4" />} title="Farming techniques" />
                  <MobileLink href="/trees" icon={<TreePine className="h-4 w-4" />} title="Trees & plants" />

                  {role === "farmer" && (
                    <>
                      <Section>My farm</Section>
                      <MobileLink href="/farmer/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} title="Dashboard" />
                      <MobileLink href="/farmer/crop-entry" icon={<ClipboardList className="h-4 w-4" />} title="Log a crop" />
                      <MobileLink href="/farmer/trends" icon={<TrendingUp className="h-4 w-4" />} title="Trends" />
                      <MobileLink href="/weather" icon={<Cloud className="h-4 w-4" />} title="My weather" />
                    </>
                  )}

                  {role === "admin" && (
                    <>
                      <Section>Admin</Section>
                      <MobileLink href="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} title="Dashboard" />
                      <MobileLink href="/admin/analysis" icon={<BarChart3 className="h-4 w-4" />} title="Crop entries" />
                      <MobileLink href="/admin/health" icon={<ShieldCheck className="h-4 w-4" />} title="System health" />
                    </>
                  )}

                  <Section>Account</Section>
                  <MobileLink href="/profile" icon={<User className="h-4 w-4" />} title={username || "Profile"} />
                  <MobileLink href="/contactus" icon={<Mail className="h-4 w-4" />} title="Contact us" />
                  <MobileLink href="/logout" icon={<LogOut className="h-4 w-4" />} title="Sign out" danger />
                </>
              )}

              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2 pt-3 px-1">
                  <Link
                    href="/login"
                    className="text-center text-sm font-medium text-stone-900 border border-stone-300 hover:border-stone-400 rounded-full py-2 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-center text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-full py-2 transition-colors"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
        active
          ? "text-stone-900 bg-stone-100"
          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
      }`}
    >
      {children}
    </Link>
  );
}

const Dropdown = React.forwardRef<
  HTMLDivElement,
  {
    label: string;
    open: boolean;
    active?: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }
>(({ label, open, active, onToggle, children }, ref) => {
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
          active
            ? "text-stone-900 bg-stone-100"
            : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 bg-white p-2 rounded-xl shadow-lg z-50 min-w-[260px] border border-stone-200"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
Dropdown.displayName = "Dropdown";

function DropdownItem({
  href,
  icon,
  title,
  subtitle,
  onClick,
  iconBg = "bg-stone-100",
  iconColor = "text-stone-700",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-stone-50 transition-colors group"
    >
      <span className={`${iconBg} ${iconColor} p-2 rounded-md group-hover:scale-105 transition-transform`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-stone-900 text-sm">{title}</p>
        {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
      </div>
    </Link>
  );
}

function MobileLink({
  href,
  icon,
  title,
  danger,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-stone-700 hover:bg-stone-100"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-stone-500"}>{icon}</span>
      <span className="font-medium text-sm">{title}</span>
    </Link>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.15em] px-3 pt-3 pb-1">
      {children}
    </p>
  );
}
