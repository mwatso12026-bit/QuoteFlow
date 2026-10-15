import { useEffect, useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  ArrowUpRight,
  Menu,
  Layers,
  RotateCcw,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../components/ui/dialog'
export type Page = 'Overview' | 'Leads' | 'Estimates' | 'Request form'
const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Leads', icon: Users },
  { name: 'Estimates', icon: FileText },
  { name: 'Request form', icon: ClipboardList },
] as const
export function AppShell({
  page,
  onNavigate,
  onReset,
  children,
}: {
  page: Page
  onNavigate: (p: Page) => void
  onReset: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [mobile, setMobile] = useState(
    () => window.matchMedia?.('(max-width: 767px)').matches ?? false,
  )
  useEffect(() => {
    const media = window.matchMedia?.('(max-width: 767px)')
    if (!media) return
    const update = () => {
      setMobile(media.matches)
      setOpen(false)
    }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const content = (
    <>
      <div className="brand">
        <span className="brand-mark">
          <Layers size={20} />
        </span>
        <span>
          Quote<span className="brand-accent">Flow</span>
        </span>
      </div>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav aria-label="Main navigation">
        {navigation.map(({ name, icon: Icon }) => (
          <button
            key={name}
            aria-current={page === name ? 'page' : undefined}
            onClick={() => {
              onNavigate(name)
              setOpen(false)
            }}
          >
            <Icon size={19} />
            <span>{name}</span>
            {name === page && <span className="nav-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-card">
          <div className="workspace-symbol">S</div>
          <div>
            <strong>Service Studio</strong>
            <span>Demo workspace</span>
          </div>
          <ArrowUpRight size={15} />
        </div>
        <button
          className="reset-button"
          onClick={() => {
            setOpen(false)
            onReset()
          }}
        >
          <RotateCcw size={15} />
          Reset demo data
        </button>
        <div className="sidebar-foot">
          A little less admin.
          <br />A lot more possibility.
        </div>
      </div>
    </>
  )
  return (
    <Dialog open={mobile && open} onOpenChange={setOpen}>
      <div className="app-shell">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {!mobile && <aside className="sidebar">{content}</aside>}
        {mobile && (
          <DialogContent
            className="sidebar mobile-sidebar"
            style={{
              top: 0,
              left: 0,
              transform: 'none',
              translate: 'none',
              width: 'min(280px,85vw)',
              maxWidth: 'none',
              height: '100dvh',
            }}
          >
            <DialogTitle className="sr-only">Workspace navigation</DialogTitle>
            <DialogDescription className="sr-only">Choose a QuoteFlow screen.</DialogDescription>
            {content}
          </DialogContent>
        )}
        <div className="main-wrap">
          <div className="topbar">
            <div className="breadcrumb">
              {mobile && (
                <DialogTrigger asChild>
                  <button className="menu-button" aria-label="Open navigation">
                    <Menu />
                  </button>
                </DialogTrigger>
              )}
              <span>Workspace</span>
              <span className="slash">/</span>
              <strong>{page}</strong>
            </div>
            <div className="topbar-right">
              <span className="demo-pill">
                <span />
                Demo mode
              </span>
              <span className="profile-avatar" aria-label="Demo workspace">
                SS
              </span>
            </div>
          </div>
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <footer>
            <span>
              <span className="footer-dot" />
              QuoteFlow · Demo workspace
            </span>
            <span>Fictional data. Real possibilities.</span>
          </footer>
        </div>
      </div>
    </Dialog>
  )
}
