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
import TagExtractor from "./pages/TagExtractor";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolbarLayout />}>
          <Route index element={<Home />} />
          <Route path="thumbnail-downloader" element={<ThumbnailDownloader />} />
          <Route path="thumbnail-preview" element={<ThumbnailPreview />} />
          <Route path="thumbnail-battle" element={<ThumbnailBattle />} />
          <Route path="battle/:id" element={<BattleView />} />
          <Route path="title-generator" element={<TitleGenerator />} />
          <Route path="hashtag-generator" element={<HashtagGenerator />} />
          <Route path="description-generator" element={<DescriptionGenerator />} />
          <Route path="channel-name-generator" element={<ChannelNameGenerator />} />
          <Route path="tag-extractor" element={<TagExtractor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
