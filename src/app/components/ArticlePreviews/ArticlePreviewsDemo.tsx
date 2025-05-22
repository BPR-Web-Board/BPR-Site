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
		author_obj: {
			id: 1,
			name: "Jane Doe",
			url: "#",
			description: "",
			link: "#",
			slug: "jane-doe",
			avatar_urls: {},
			meta: [],
		},
		featured_media_obj: {
			id: 1,
			date: "2024-01-01T00:00:00",
			slug: "mock-image-1",
			type: "attachment",
			link: "#",
			title: { rendered: "Mock Image" },
			author: 1,
			caption: { rendered: "" },
			alt_text: "Mock image alt text",
		 media_type: "image",
			mime_type: "image/jpeg",
		 media_details: {
				width: 800,
				height: 600,
				file: "mock-image.jpg",
				sizes: {},
			},
			source_url: "/logo/logo.svg",
		},
		categories: [1],
		categories_obj: [
			{
				id: 1,
				count: 1,
				description: "",
				link: "#",
				name: "United States",
				slug: "united-states",
				taxonomy: "category",
				parent: 0,
				meta: [],
			},
		],
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
		author_obj: {
			id: 2,
			name: "John Smith",
			url: "#",
			description: "",
			link: "#",
			slug: "john-smith",
			avatar_urls: {},
			meta: [],
		},
		featured_media_obj: null,
		categories: [2],
		categories_obj: [
			{
				id: 2,
				count: 1,
				description: "",
				link: "#",
				name: "World",
				slug: "world",
				taxonomy: "category",
				parent: 0,
				meta: [],
			},
		],
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
