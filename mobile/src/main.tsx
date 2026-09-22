import { Component, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Routes,
  Route,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Provider } from "../../components/Provider";
import { Shell } from "../../components/Shell";
import Home from "../../app/page";
import Archive from "../../app/archive/page";
import Profile from "../../app/profile/page";
import Settings from "../../app/settings/page";
import Achievements from "../../app/achievements/page";
import NotFound from "../../app/not-found";
import Investigation from "../../components/game/Investigation";
import { catalog } from "../../data/catalog";
import "../../app/globals.css";
import "./mobile.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="page">
        <h1>Unable to display this page</h1>
        <p>Your last saved progress remains on this device.</p>
        <button className="button" onClick={() => location.reload()}>
          Restart app
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function CaseRoute() {
  const { id } = useParams();
  return id && catalog.some((c) => c.id === id) ? (
    <Investigation key={id} id={id} />
  ) : (
    <NotFound />
  );
}
function Navigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = App.addListener("backButton", () => {
      if (pathname === "/") void App.exitApp();
      else navigate(pathname.startsWith("/case/") ? "/archive" : "/");
    });
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [pathname, navigate]);
  return null;
}
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <HashRouter>
      <Navigation />
      <button
        className="skip-link"
        onClick={() => {
          document.getElementById("main-content")?.focus();
          document.getElementById("main-content")?.scrollIntoView();
        }}
      >
        Skip to main content
      </button>
      <Provider>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/case/:id" element={<CaseRoute />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </Provider>
    </HashRouter>
  </ErrorBoundary>,
);
