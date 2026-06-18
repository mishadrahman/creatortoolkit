/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToolbarLayout from "./components/ToolbarLayout";
import { AuthProvider } from "./lib/AuthContext";
import Home from "./pages/Home";

// Lazy-loaded pages to enable code splitting for heavy sub-tools
const ThumbnailDownloader = lazy(() => import("./pages/ThumbnailDownloader"));
const ThumbnailPreview = lazy(() => import("./pages/ThumbnailPreview"));
const ThumbnailBattle = lazy(() => import("./pages/ThumbnailBattle"));
const MyBattles = lazy(() => import("./pages/MyBattles"));
const BattleView = lazy(() => import("./pages/BattleView"));
const TitleGenerator = lazy(() => import("./pages/TitleGenerator"));
const HashtagGenerator = lazy(() => import("./pages/HashtagGenerator"));
const DescriptionGenerator = lazy(() => import("./pages/DescriptionGenerator"));
const ChannelNameGenerator = lazy(() => import("./pages/ChannelNameGenerator"));

// Elegant loader fallback keeping with Toolzet theme
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 font-sans tracking-wide">Loading tool...</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={(import.meta as any).env?.BASE_URL || '/'}>
        <Routes>
          <Route path="/" element={<ToolbarLayout />}>
            <Route index element={<Home />} />
            <Route path="thumbnail-downloader" element={
              <Suspense fallback={<PageLoader />}>
                <ThumbnailDownloader />
              </Suspense>
            } />
            <Route path="thumbnail-preview" element={
              <Suspense fallback={<PageLoader />}>
                <ThumbnailPreview />
              </Suspense>
            } />
            <Route path="thumbnail-battle" element={
              <Suspense fallback={<PageLoader />}>
                <ThumbnailBattle />
              </Suspense>
            } />
            <Route path="my-battles" element={
              <Suspense fallback={<PageLoader />}>
                <MyBattles />
              </Suspense>
            } />
            <Route path="battle/:id" element={
              <Suspense fallback={<PageLoader />}>
                <BattleView />
              </Suspense>
            } />
            <Route path="title-generator" element={
              <Suspense fallback={<PageLoader />}>
                <TitleGenerator />
              </Suspense>
            } />
            <Route path="hashtag-generator" element={
              <Suspense fallback={<PageLoader />}>
                <HashtagGenerator />
              </Suspense>
            } />
            <Route path="description-generator" element={
              <Suspense fallback={<PageLoader />}>
                <DescriptionGenerator />
              </Suspense>
            } />
            <Route path="channel-name-generator" element={
              <Suspense fallback={<PageLoader />}>
                <ChannelNameGenerator />
              </Suspense>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
