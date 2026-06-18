/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { Layout } from "lucide-react";

import Home from "./pages/Home";
import ToolbarLayout from "./components/ToolbarLayout";
import ThumbnailDownloader from "./pages/ThumbnailDownloader";
import ThumbnailPreview from "./pages/ThumbnailPreview";
import ThumbnailBattle from "./pages/ThumbnailBattle";
import BattleView from "./pages/BattleView";
import TitleGenerator from "./pages/TitleGenerator";
import HashtagGenerator from "./pages/HashtagGenerator";
import DescriptionGenerator from "./pages/DescriptionGenerator";
import ChannelNameGenerator from "./pages/ChannelNameGenerator";
import MyBattles from "./pages/MyBattles";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactSupport from "./pages/ContactSupport";
import { AuthProvider } from "./lib/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={(import.meta as any).env?.BASE_URL || '/'}>
        <Routes>
          <Route path="/" element={<ToolbarLayout />}>
            <Route index element={<Home />} />
            <Route path="thumbnail-downloader" element={<ThumbnailDownloader />} />
            <Route path="thumbnail-preview" element={<ThumbnailPreview />} />
            <Route path="thumbnail-battle" element={<ThumbnailBattle />} />
            <Route path="my-battles" element={<MyBattles />} />
            <Route path="battle/:id" element={<BattleView />} />
            <Route path="title-generator" element={<TitleGenerator />} />
            <Route path="hashtag-generator" element={<HashtagGenerator />} />
            <Route path="description-generator" element={<DescriptionGenerator />} />
            <Route path="channel-name-generator" element={<ChannelNameGenerator />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="contact-support" element={<ContactSupport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
