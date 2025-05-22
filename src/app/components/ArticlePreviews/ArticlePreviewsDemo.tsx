import React from "react";
import { LargeArticlePreview, SmallArticlePreview } from ".";
import { EnhancedPost } from "../../lib/types";

// Minimal mock data for demo
const mockPosts: EnhancedPost[] = [
	{
		id: 1,
		slug: "mock-article-1",
		title: { rendered: "Mock Article One" },
		excerpt: {
			rendered: "<p>This is a mock excerpt for article one.</p>",
			protected: false,
		},
		author_name: "Jane Doe",
		author_obj: { name: "Jane Doe" } as any,
		featured_media_obj: {
			source_url: "/logo/logo.svg",
			alt_text: "Mock image alt text",
		} as any,
		categories: [{ slug: "united-states" }] as any,
		// Required EnhancedPost fields
		link: "/united-states/article/mock-article-1",
		date: "2024-01-01T00:00:00",
		date_gmt: "2024-01-01T00:00:00Z",
		guid: { rendered: "mock-guid-1" },
		modified: "2024-01-01T00:00:00",
		modified_gmt: "2024-01-01T00:00:00Z",
		status: "publish",
		type: "post",
		content: { rendered: "", protected: false },
		author: 1,
		featured_media: 1,
		format: "standard",
		meta: {},
		categories_obj: [],
		tags: [],
		class_list: [],
		coauthors: [],
	},
	{
		id: 2,
		slug: "mock-article-2",
		title: { rendered: "Mock Article Two" },
		excerpt: {
			rendered: "<p>This is a mock excerpt for article two.</p>",
			protected: false,
		},
		author_name: "John Smith",
		author_obj: { name: "John Smith" } as any,
		featured_media_obj: null,
		categories: [{ slug: "world" }] as any,
		// Required EnhancedPost fields
		link: "/world/article/mock-article-2",
		date: "2024-01-02T00:00:00",
		date_gmt: "2024-01-02T00:00:00Z",
		guid: { rendered: "mock-guid-2" },
		modified: "2024-01-02T00:00:00",
		modified_gmt: "2024-01-02T00:00:00Z",
		status: "publish",
		type: "post",
		content: { rendered: "", protected: false },
		author: 2,
		featured_media: 2,
		format: "standard",
		meta: {},
		categories_obj: [],
		tags: [],
		class_list: [],
		coauthors: [],
	},
];

const ArticlePreviewsDemo = () => (
	<div style={{ background: "#f8f8f8", padding: 32 }}>
		<h2>LargeArticlePreview Demo</h2>
		<LargeArticlePreview
			post={mockPosts[0]}
			showExcerpt
			imageAspectRatio="16/9"
		/>
		<LargeArticlePreview
			post={mockPosts[1]}
			showExcerpt={false}
			imageAspectRatio="4/3"
		/>

		<h2 style={{ marginTop: 40 }}>SmallArticlePreview Demo (Vertical)</h2>
		<SmallArticlePreview
			post={mockPosts[0]}
			layout="vertical"
			showExcerpt
			imageSize="medium"
		/>
		<SmallArticlePreview
			post={mockPosts[1]}
			layout="vertical"
			showExcerpt={false}
			imageSize="small"
		/>

		<h2 style={{ marginTop: 40 }}>SmallArticlePreview Demo (Horizontal)</h2>
		<SmallArticlePreview
			post={mockPosts[0]}
			layout="horizontal"
			showExcerpt
			imageSize="medium"
		/>
		<SmallArticlePreview
			post={mockPosts[1]}
			layout="horizontal"
			showExcerpt={false}
			imageSize="small"
		/>
	</div>
);

export default ArticlePreviewsDemo;
