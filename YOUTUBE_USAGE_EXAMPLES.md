# YouTube MCP Server - Usage Examples

## Overview

The YouTube MCP server provides access to YouTube Data API v3 functionality, allowing you to search videos, get details, explore channels, playlists, trending content, and comments.

## Quick Start

### 1. Set Up API Key

```bash
# Get your API key from: https://console.cloud.google.com/
export YOUTUBE_API_KEY="your_api_key_here"
```

### 2. Start the Server

```bash
# Development mode
npm run dev-youtube

# Production mode
PORT=3006 YOUTUBE_API_KEY=your_key node dist/youtube-server.js
```

### 3. Access Web Interface

Open http://localhost:3006 in your browser for an interactive interface.

## API Examples

### Example 1: Search Videos

Search for videos with different filters:

```bash
# Basic search
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "searchVideos",
    "arguments": {
      "query": "how to code in Python",
      "maxResults": 10,
      "order": "relevance"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "how to code in Python",
  "totalResults": 1000000,
  "videos": [
    {
      "videoId": "rfscVS0vtbw",
      "title": "Learn Python - Full Course for Beginners",
      "description": "This course will give you a full introduction...",
      "channelTitle": "freeCodeCamp.org",
      "channelId": "UC8butISFwT-Wl7EV0hUK0BQ",
      "publishedAt": "2018-07-11T15:00:00Z",
      "thumbnails": {...}
    }
  ],
  "count": 10
}
```

**Search by Date (Newest First):**
```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "searchVideos",
    "arguments": {
      "query": "AI news",
      "maxResults": 5,
      "order": "date"
    }
  }'
```

**Search by View Count (Most Popular):**
```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "searchVideos",
    "arguments": {
      "query": "cooking recipes",
      "maxResults": 10,
      "order": "viewCount"
    }
  }'
```

### Example 2: Get Video Details

Get comprehensive information about a specific video:

```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getVideoDetails",
    "arguments": {
      "videoId": "dQw4w9WgXcQ"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "description": "The official video for 'Never Gonna Give You Up'...",
  "channelTitle": "RickAstleyVEVO",
  "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "publishedAt": "2009-10-25T06:57:33Z",
  "statistics": {
    "viewCount": "1500000000",
    "likeCount": "15000000",
    "commentCount": "5000000"
  },
  "duration": "PT3M33S",
  "tags": ["rick", "astley", "never", "gonna"]
}
```

### Example 3: Get Channel Information

Get statistics and details about a YouTube channel:

```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getChannelInfo",
    "arguments": {
      "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "title": "Google Developers",
  "description": "The official channel for Google Developers...",
  "customUrl": "@googledevelopers",
  "statistics": {
    "viewCount": "500000000",
    "subscriberCount": "5000000",
    "videoCount": "5000"
  },
  "thumbnails": {...}
}
```

### Example 4: Get Channel Videos

Get all videos from a specific channel:

```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getChannelVideos",
    "arguments": {
      "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "maxResults": 20
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "videoId": "abc123",
      "title": "Latest Google Developer Update",
      "channelTitle": "Google Developers",
      "publishedAt": "2024-01-15T10:00:00Z",
      "thumbnails": {...}
    }
  ],
  "count": 20
}
```

### Example 5: Get Playlist Videos

Get videos from a YouTube playlist:

```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getPlaylistVideos",
    "arguments": {
      "playlistId": "PLrAXtmRdnEQy6nuLM9Mk_3m4q6bPx2",
      "maxResults": 10
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "playlistId": "PLrAXtmRdnEQy6nuLM9Mk_3m4q6bPx2",
  "videos": [
    {
      "videoId": "xyz789",
      "title": "Playlist Video 1",
      "description": "...",
      "publishedAt": "2024-01-10T08:00:00Z"
    }
  ],
  "count": 10
}
```

### Example 6: Get Trending Videos

Get trending videos for a specific region:

```bash
# Trending in United States
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getTrendingVideos",
    "arguments": {
      "regionCode": "US",
      "maxResults": 10
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "regionCode": "US",
  "categoryId": "0",
  "videos": [
    {
      "videoId": "trending123",
      "title": "Trending Video Title",
      "statistics": {
        "viewCount": "5000000",
        "likeCount": "200000",
        "commentCount": "50000"
      }
    }
  ],
  "count": 10
}
```

**Trending in Different Regions:**
```bash
# United Kingdom
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getTrendingVideos",
    "arguments": {
      "regionCode": "GB",
      "maxResults": 10
    }
  }'

# Japan
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getTrendingVideos",
    "arguments": {
      "regionCode": "JP",
      "maxResults": 10
    }
  }'
```

### Example 7: Get Video Comments

Get comments for a specific video:

```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getVideoComments",
    "arguments": {
      "videoId": "dQw4w9WgXcQ",
      "maxResults": 20
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "comments": [
    {
      "commentId": "Ugz...",
      "text": "Great video!",
      "author": "John Doe",
      "authorChannelId": "UC...",
      "likeCount": 150,
      "publishedAt": "2024-01-15T12:00:00Z"
    }
  ],
  "count": 20
}
```

## JavaScript/TypeScript Usage

### Using Fetch API

```javascript
// Search for videos
async function searchYouTube(query, maxResults = 10) {
  const response = await fetch('http://localhost:3006/mcp/tools/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'searchVideos',
      arguments: { query, maxResults, order: 'relevance' }
    })
  });
  const data = await response.json();
  return data.videos;
}

// Usage
const videos = await searchYouTube('JavaScript tutorials', 5);
videos.forEach(video => {
  console.log(`${video.title} - ${video.channelTitle}`);
  console.log(`https://www.youtube.com/watch?v=${video.videoId}`);
});
```

### Get Video Statistics

```javascript
async function getVideoStats(videoId) {
  const response = await fetch('http://localhost:3006/mcp/tools/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'getVideoDetails',
      arguments: { videoId }
    })
  });
  const data = await response.json();
  return data.statistics;
}

// Usage
const stats = await getVideoStats('dQw4w9WgXcQ');
console.log(`Views: ${stats.viewCount}`);
console.log(`Likes: ${stats.likeCount}`);
console.log(`Comments: ${stats.commentCount}`);
```

### Channel Analysis

```javascript
async function analyzeChannel(channelId) {
  const [channelInfo, channelVideos] = await Promise.all([
    fetch('http://localhost:3006/mcp/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'getChannelInfo',
        arguments: { channelId }
      })
    }).then(r => r.json()),
    fetch('http://localhost:3006/mcp/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'getChannelVideos',
        arguments: { channelId, maxResults: 10 }
      })
    }).then(r => r.json())
  ]);

  return {
    channel: channelInfo,
    recentVideos: channelVideos.videos
  };
}
```

## Python Usage

```python
import requests

def search_youtube(query, max_results=10):
    response = requests.post(
        'http://localhost:3006/mcp/tools/call',
        json={
            'name': 'searchVideos',
            'arguments': {
                'query': query,
                'maxResults': max_results,
                'order': 'relevance'
            }
        }
    )
    return response.json()['videos']

# Usage
videos = search_youtube('Python programming', 5)
for video in videos:
    print(f"{video['title']} - {video['channelTitle']}")
    print(f"https://www.youtube.com/watch?v={video['videoId']}")
```

## Real-World Use Cases

### Use Case 1: Content Research

**Scenario:** Find the most popular videos about a topic

```bash
# Get top 10 most viewed videos about "machine learning"
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "searchVideos",
    "arguments": {
      "query": "machine learning",
      "maxResults": 10,
      "order": "viewCount"
    }
  }'
```

### Use Case 2: Competitor Analysis

**Scenario:** Analyze a competitor's channel

```bash
# Step 1: Get channel info
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getChannelInfo",
    "arguments": {
      "channelId": "competitor_channel_id"
    }
  }'

# Step 2: Get their recent videos
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getChannelVideos",
    "arguments": {
      "channelId": "competitor_channel_id",
      "maxResults": 20
    }
  }'
```

### Use Case 3: Trending Content Discovery

**Scenario:** Find what's trending in your region

```bash
# Get trending videos in US
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getTrendingVideos",
    "arguments": {
      "regionCode": "US",
      "maxResults": 20
    }
  }'
```

### Use Case 4: Playlist Management

**Scenario:** Get all videos from a curated playlist

```bash
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getPlaylistVideos",
    "arguments": {
      "playlistId": "your_playlist_id",
      "maxResults": 50
    }
  }'
```

### Use Case 5: Video Engagement Analysis

**Scenario:** Analyze engagement metrics for a video

```bash
# Get video details with statistics
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getVideoDetails",
    "arguments": {
      "videoId": "your_video_id"
    }
  }'

# Get comments to analyze sentiment
curl -X POST http://localhost:3006/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "getVideoComments",
    "arguments": {
      "videoId": "your_video_id",
      "maxResults": 100
    }
  }'
```

## LLM Integration Examples

### Example 1: Natural Language Video Search

**User:** "Find me the top 5 most popular Python tutorials"

**LLM Process:**
1. Understands the request
2. Calls `searchVideos` with:
   - query: "Python tutorials"
   - maxResults: 5
   - order: "viewCount"
3. Formats results for user

**LLM Response:**
```
Here are the top 5 most popular Python tutorials:

1. "Learn Python - Full Course for Beginners" by freeCodeCamp.org
   - 50M views
   - https://www.youtube.com/watch?v=rfscVS0vtbw

2. "Python for Everybody - Full Course" by freeCodeCamp.org
   - 30M views
   - https://www.youtube.com/watch?v=8DvywoWv6fI

[... more results ...]
```

### Example 2: Channel Analysis Request

**User:** "Tell me about the Google Developers channel"

**LLM Process:**
1. Calls `getChannelInfo` with channel ID
2. Calls `getChannelVideos` to get recent content
3. Analyzes and summarizes

**LLM Response:**
```
Google Developers channel:
- Subscribers: 5M
- Total Videos: 5,000
- Total Views: 500M

Recent videos include:
- "Latest Google Developer Update" (published 2 days ago)
- "Android Development Tips" (published 5 days ago)
[...]
```

### Example 3: Content Discovery

**User:** "What's trending in tech right now?"

**LLM Process:**
1. Calls `getTrendingVideos` with regionCode: "US"
2. Filters or analyzes results
3. Provides summary

**LLM Response:**
```
Here are the trending tech videos in the US:

1. "AI Breakthrough: New GPT Model Released" - 2M views
2. "Latest iPhone Features Explained" - 1.5M views
[...]
```

## Web Interface Usage

### 1. Search Videos
- Enter search query in "Search Videos" card
- Select max results (1-50)
- Choose sort order (relevance, date, rating, etc.)
- Click "Search"
- Results display with thumbnails, titles, and links

### 2. Get Video Details
- Enter video ID in "Video Details" card
- Click "Get Details" for video information
- Click "Get Comments" to see comments

### 3. Channel Information
- Enter channel ID
- Click "Get Channel Info" for statistics
- Click "Get Channel Videos" to see their content

### 4. Playlists & Trending
- Switch between "Playlist" and "Trending" tabs
- Enter playlist ID or select region
- View results with video cards

## Error Handling

All tools return errors in this format:

```json
{
  "error": "YOUTUBE_API_KEY environment variable not set"
}
```

Common errors:
- **Missing API Key**: Set `YOUTUBE_API_KEY` environment variable
- **Invalid Video ID**: Check the video ID format
- **Quota Exceeded**: YouTube API has daily limits (10,000 units/day free tier)
- **Invalid Channel ID**: Verify the channel ID is correct

## API Quota Management

YouTube Data API v3 has quota limits:
- **Free Tier**: 10,000 units per day
- **Search**: ~100 units per request
- **Video Details**: ~1 unit per request
- **Channel Info**: ~1 unit per request

Monitor your usage at: https://console.cloud.google.com/

## Tips & Best Practices

1. **Cache Results**: Store frequently accessed data to reduce API calls
2. **Batch Requests**: Combine multiple operations when possible
3. **Handle Errors**: Always check for error responses
4. **Rate Limiting**: Implement delays between requests if needed
5. **Validate Inputs**: Check video/channel IDs before making requests
6. **Use Filters**: Use `order` parameter to get relevant results
7. **Limit Results**: Use `maxResults` to control response size

## Available Tools Summary

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `searchVideos` | Search YouTube | query, maxResults, order |
| `getVideoDetails` | Video info | videoId |
| `getChannelInfo` | Channel stats | channelId |
| `getChannelVideos` | Channel content | channelId, maxResults |
| `getPlaylistVideos` | Playlist content | playlistId, maxResults |
| `getTrendingVideos` | Trending content | regionCode, maxResults |
| `getVideoComments` | Video comments | videoId, maxResults |

## Conclusion

The YouTube MCP server provides comprehensive access to YouTube's data through a simple API interface. Whether you're building content research tools, competitor analysis systems, or integrating with LLMs, this server makes YouTube data easily accessible.

