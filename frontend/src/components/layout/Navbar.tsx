import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Cloud, Users, LogOut, User, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo e nome */}
          <div className="flex items-center gap-2">
            <Cloud className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              GDASH Weather
            </span>
          </div>

          {/* ---------- MENU DESKTOP ---------- */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className="gap-2"
              >
                <Cloud className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            {user?.role === "admin" && (
              <Link to="/users">
                <Button
                  variant={isActive("/users") ? "default" : "ghost"}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Usuários
                </Button>
              </Link>
            )}

            {/* Menu do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground">
                    Role: {user?.role}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ---------- BOTÃO HAMBÚRGUER (MOBILE) ---------- */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* ---------- MENU MOBILE ---------- */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Cloud className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            {user?.role === "admin" && (
              <Link to="/users" onClick={() => setIsOpen(false)}>
                <Button
                  variant={isActive("/users") ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Users className="h-4 w-4" />
                  Usuários
                </Button>
              </Link>
            )}

            {/* Usuário */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 px-2">
                <User className="h-6 w-6" />
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                  <span className="text-xs text-muted-foreground">Role: {user?.role}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-destructive mt-3 gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
