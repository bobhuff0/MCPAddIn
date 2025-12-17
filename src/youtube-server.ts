import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { google } from 'googleapis';
import fs from 'fs';

const APP_NAME = 'MCP YouTube Query App';
const PORT = process.env.PORT || 3006;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const GOOGLE_CLIENT_SECRET_PATH = process.env.GOOGLE_CLIENT_SECRET_PATH || 
  path.join(__dirname, '../client_secret_2_849129750049-j8dmbq425df9tq0lvpbi94do3qo2tn9d.apps.googleusercontent.com.json');

// Initialize YouTube API client
let youtube: any;
let hasAuth = false;

if (YOUTUBE_API_KEY) {
  // Use API key (simplest method)
  youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY,
  });
  hasAuth = true;
  console.log('✅ Using YouTube API Key authentication');
} else if (fs.existsSync(GOOGLE_CLIENT_SECRET_PATH)) {
  // Try to use OAuth client credentials
  try {
    const credentials = JSON.parse(fs.readFileSync(GOOGLE_CLIENT_SECRET_PATH, 'utf8'));
    const oauth2Client = new google.auth.OAuth2(
      credentials.installed?.client_id || credentials.web?.client_id,
      credentials.installed?.client_secret || credentials.web?.client_secret,
      credentials.installed?.redirect_uris?.[0] || credentials.web?.redirect_uris?.[0] || 'http://localhost'
    );
    
    // For server-to-server, we'd need a refresh token
    // For now, we'll use API key method which is simpler
    youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });
    hasAuth = true;
    console.log('✅ Using OAuth client credentials (note: may require user consent)');
  } catch (error) {
    console.error('⚠️  Failed to load OAuth credentials, falling back to API key method');
    youtube = google.youtube({
      version: 'v3',
    });
  }
} else {
  youtube = google.youtube({
    version: 'v3',
  });
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public-youtube')));

// Serve the web interface HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-youtube/index.html'));
});

// MCP Tool endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    let result;
    switch (name) {
      case 'searchVideos':
        result = await searchVideos(args.query, args.maxResults, args.order);
        break;
      case 'getVideoDetails':
        result = await getVideoDetails(args.videoId);
        break;
      case 'getChannelInfo':
        result = await getChannelInfo(args.channelId);
        break;
      case 'getChannelVideos':
        result = await getChannelVideos(args.channelId, args.maxResults);
        break;
      case 'getPlaylistVideos':
        result = await getPlaylistVideos(args.playlistId, args.maxResults);
        break;
      case 'getTrendingVideos':
        result = await getTrendingVideos(args.regionCode, args.categoryId, args.maxResults);
        break;
      case 'getVideoComments':
        result = await getVideoComments(args.videoId, args.maxResults);
        break;
      default:
        return res.status(400).json({ error: `Unknown tool: ${name}` });
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error calling tool:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// MCP Discovery endpoint
app.get('/mcp', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "YouTubeMCP",
        version: "1.0.0"
      }
    }
  });
});

// ChatGPT MCP Connector endpoint
app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;
  
  console.log('MCP Request:', JSON.stringify({ method, params, id }));
  
  if (method === "initialize") {
    res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "YouTube Query MCP",
          version: "1.0.0"
        }
      }
    });
  } else if (method === "tools/list") {
    res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        tools: [
          {
            name: "searchVideos",
            description: "Search for videos on YouTube",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query (e.g., 'how to code', 'cooking recipes')"
                },
                maxResults: {
                  type: "number",
                  description: "Maximum number of results (default: 10, max: 50)",
                  default: 10
                },
                order: {
                  type: "string",
                  enum: ["relevance", "date", "rating", "title", "viewCount"],
                  description: "Sort order (default: relevance)",
                  default: "relevance"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "getVideoDetails",
            description: "Get detailed information about a specific video",
            inputSchema: {
              type: "object",
              properties: {
                videoId: {
                  type: "string",
                  description: "YouTube video ID (e.g., 'dQw4w9WgXcQ')"
                }
              },
              required: ["videoId"]
            }
          },
          {
            name: "getChannelInfo",
            description: "Get information about a YouTube channel",
            inputSchema: {
              type: "object",
              properties: {
                channelId: {
                  type: "string",
                  description: "YouTube channel ID"
                }
              },
              required: ["channelId"]
            }
          },
          {
            name: "getChannelVideos",
            description: "Get videos from a specific channel",
            inputSchema: {
              type: "object",
              properties: {
                channelId: {
                  type: "string",
                  description: "YouTube channel ID"
                },
                maxResults: {
                  type: "number",
                  description: "Maximum number of results (default: 10)",
                  default: 10
                }
              },
              required: ["channelId"]
            }
          },
          {
            name: "getPlaylistVideos",
            description: "Get videos from a YouTube playlist",
            inputSchema: {
              type: "object",
              properties: {
                playlistId: {
                  type: "string",
                  description: "YouTube playlist ID"
                },
                maxResults: {
                  type: "number",
                  description: "Maximum number of results (default: 10)",
                  default: 10
                }
              },
              required: ["playlistId"]
            }
          },
          {
            name: "getTrendingVideos",
            description: "Get trending videos for a region",
            inputSchema: {
              type: "object",
              properties: {
                regionCode: {
                  type: "string",
                  description: "ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'CA')",
                  default: "US"
                },
                categoryId: {
                  type: "string",
                  description: "Video category ID (optional)",
                  default: "0"
                },
                maxResults: {
                  type: "number",
                  description: "Maximum number of results (default: 10)",
                  default: 10
                }
              }
            }
          },
          {
            name: "getVideoComments",
            description: "Get comments for a video",
            inputSchema: {
              type: "object",
              properties: {
                videoId: {
                  type: "string",
                  description: "YouTube video ID"
                },
                maxResults: {
                  type: "number",
                  description: "Maximum number of comments (default: 10)",
                  default: 10
                }
              },
              required: ["videoId"]
            }
          }
        ]
      }
    });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    try {
      let result;
      switch (name) {
        case "searchVideos":
          result = await searchVideos(args.query, args.maxResults, args.order);
          break;
        case "getVideoDetails":
          result = await getVideoDetails(args.videoId);
          break;
        case "getChannelInfo":
          result = await getChannelInfo(args.channelId);
          break;
        case "getChannelVideos":
          result = await getChannelVideos(args.channelId, args.maxResults);
          break;
        case "getPlaylistVideos":
          result = await getPlaylistVideos(args.playlistId, args.maxResults);
          break;
        case "getTrendingVideos":
          result = await getTrendingVideos(args.regionCode, args.categoryId, args.maxResults);
          break;
        case "getVideoComments":
          result = await getVideoComments(args.videoId, args.maxResults);
          break;
        default:
          return res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32601,
              message: `Unknown tool: ${name}`
            }
          });
      }
      
      res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      });
    } catch (error: any) {
      res.json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32603,
          message: error.message
        }
      });
    }
  } else {
    res.json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });
  }
});

// List available tools
app.get('/mcp/tools/list', (req, res) => {
  res.json({
    tools: [
      {
        name: 'searchVideos',
        description: 'Search for videos on YouTube',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            maxResults: { type: 'number', default: 10, description: 'Max results (1-50)' },
            order: { type: 'string', enum: ['relevance', 'date', 'rating', 'title', 'viewCount'], default: 'relevance' }
          },
          required: ['query']
        }
      },
      {
        name: 'getVideoDetails',
        description: 'Get detailed information about a video',
        inputSchema: {
          type: 'object',
          properties: {
            videoId: { type: 'string', description: 'YouTube video ID' }
          },
          required: ['videoId']
        }
      },
      {
        name: 'getChannelInfo',
        description: 'Get information about a YouTube channel',
        inputSchema: {
          type: 'object',
          properties: {
            channelId: { type: 'string', description: 'YouTube channel ID' }
          },
          required: ['channelId']
        }
      },
      {
        name: 'getChannelVideos',
        description: 'Get videos from a channel',
        inputSchema: {
          type: 'object',
          properties: {
            channelId: { type: 'string' },
            maxResults: { type: 'number', default: 10 }
          },
          required: ['channelId']
        }
      },
      {
        name: 'getPlaylistVideos',
        description: 'Get videos from a playlist',
        inputSchema: {
          type: 'object',
          properties: {
            playlistId: { type: 'string' },
            maxResults: { type: 'number', default: 10 }
          },
          required: ['playlistId']
        }
      },
      {
        name: 'getTrendingVideos',
        description: 'Get trending videos',
        inputSchema: {
          type: 'object',
          properties: {
            regionCode: { type: 'string', default: 'US' },
            categoryId: { type: 'string', default: '0' },
            maxResults: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'getVideoComments',
        description: 'Get comments for a video',
        inputSchema: {
          type: 'object',
          properties: {
            videoId: { type: 'string' },
            maxResults: { type: 'number', default: 10 }
          },
          required: ['videoId']
        }
      }
    ]
  });
});

// Helper function to search videos
async function searchVideos(query: string, maxResults: number = 10, order: string = 'relevance'): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      maxResults: Math.min(maxResults || 10, 50),
      order: order as any,
      type: ['video'],
    });

    const videos = response.data.items?.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    })) || [];

    return {
      success: true,
      query: query,
      totalResults: response.data.pageInfo?.totalResults || 0,
      videos: videos,
      count: videos.length,
    };
  } catch (error: any) {
    throw new Error(`Failed to search videos: ${error.message}`);
  }
}

// Helper function to get video details
async function getVideoDetails(videoId: string): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }

    return {
      success: true,
      videoId: videoId,
      title: video.snippet?.title,
      description: video.snippet?.description,
      channelTitle: video.snippet?.channelTitle,
      channelId: video.snippet?.channelId,
      publishedAt: video.snippet?.publishedAt,
      thumbnails: video.snippet?.thumbnails,
      statistics: {
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount,
      },
      duration: video.contentDetails?.duration,
      tags: video.snippet?.tags,
    };
  } catch (error: any) {
    throw new Error(`Failed to get video details: ${error.message}`);
  }
}

// Helper function to get channel info
async function getChannelInfo(channelId: string): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: [channelId],
    });

    const channel = response.data.items?.[0];
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    return {
      success: true,
      channelId: channelId,
      title: channel.snippet?.title,
      description: channel.snippet?.description,
      customUrl: channel.snippet?.customUrl,
      publishedAt: channel.snippet?.publishedAt,
      thumbnails: channel.snippet?.thumbnails,
      statistics: {
        viewCount: channel.statistics?.viewCount,
        subscriberCount: channel.statistics?.subscriberCount,
        videoCount: channel.statistics?.videoCount,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to get channel info: ${error.message}`);
  }
}

// Helper function to get channel videos
async function getChannelVideos(channelId: string, maxResults: number = 10): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    // First get uploads playlist ID
    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      id: [channelId],
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw new Error('Could not find uploads playlist for channel');
    }

    // Get videos from uploads playlist
    return await getPlaylistVideos(uploadsPlaylistId, maxResults);
  } catch (error: any) {
    throw new Error(`Failed to get channel videos: ${error.message}`);
  }
}

// Helper function to get playlist videos
async function getPlaylistVideos(playlistId: string, maxResults: number = 10): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    const response = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: playlistId,
      maxResults: Math.min(maxResults || 10, 50),
    });

    const videos = response.data.items?.map((item: any) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    })) || [];

    return {
      success: true,
      playlistId: playlistId,
      videos: videos,
      count: videos.length,
    };
  } catch (error: any) {
    throw new Error(`Failed to get playlist videos: ${error.message}`);
  }
}

// Helper function to get trending videos
async function getTrendingVideos(regionCode: string = 'US', categoryId: string = '0', maxResults: number = 10): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      chart: 'mostPopular',
      regionCode: regionCode,
      videoCategoryId: categoryId,
      maxResults: Math.min(maxResults || 10, 50),
    });

    const videos = response.data.items?.map((video: any) => ({
      videoId: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      channelTitle: video.snippet?.channelTitle,
      channelId: video.snippet?.channelId,
      publishedAt: video.snippet?.publishedAt,
      thumbnails: video.snippet?.thumbnails,
      statistics: {
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount,
      },
    })) || [];

    return {
      success: true,
      regionCode: regionCode,
      categoryId: categoryId,
      videos: videos,
      count: videos.length,
    };
  } catch (error: any) {
    throw new Error(`Failed to get trending videos: ${error.message}`);
  }
}

// Helper function to get video comments
async function getVideoComments(videoId: string, maxResults: number = 10): Promise<any> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY environment variable not set');
  }

  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: Math.min(maxResults || 10, 100),
      order: 'relevance',
    });

    const comments = response.data.items?.map((item: any) => ({
      commentId: item.id,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      authorChannelId: item.snippet.topLevelComment.snippet.authorChannelId,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      updatedAt: item.snippet.topLevelComment.snippet.updatedAt,
    })) || [];

    return {
      success: true,
      videoId: videoId,
      comments: comments,
      count: comments.length,
    };
  } catch (error: any) {
    throw new Error(`Failed to get video comments: ${error.message}`);
  }
}

// Create MCP Server
const mcpServer = new Server(
  {
    name: APP_NAME,
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register MCP handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'searchVideos',
        description: 'Search for videos on YouTube',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            maxResults: { type: 'number', default: 10 },
            order: { type: 'string', enum: ['relevance', 'date', 'rating', 'title', 'viewCount'], default: 'relevance' }
          },
          required: ['query']
        }
      },
      {
        name: 'getVideoDetails',
        description: 'Get detailed information about a video',
        inputSchema: {
          type: 'object',
          properties: {
            videoId: { type: 'string', description: 'YouTube video ID' }
          },
          required: ['videoId']
        }
      },
      {
        name: 'getChannelInfo',
        description: 'Get information about a YouTube channel',
        inputSchema: {
          type: 'object',
          properties: {
            channelId: { type: 'string' }
          },
          required: ['channelId']
        }
      },
      {
        name: 'getChannelVideos',
        description: 'Get videos from a channel',
        inputSchema: {
          type: 'object',
          properties: {
            channelId: { type: 'string' },
            maxResults: { type: 'number', default: 10 }
          },
          required: ['channelId']
        }
      },
      {
        name: 'getPlaylistVideos',
        description: 'Get videos from a playlist',
        inputSchema: {
          type: 'object',
          properties: {
            playlistId: { type: 'string' },
            maxResults: { type: 'number', default: 10 }
          },
          required: ['playlistId']
        }
      },
      {
        name: 'getTrendingVideos',
        description: 'Get trending videos',
        inputSchema: {
          type: 'object',
          properties: {
            regionCode: { type: 'string', default: 'US' },
            categoryId: { type: 'string', default: '0' },
            maxResults: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'getVideoComments',
        description: 'Get comments for a video',
        inputSchema: {
          type: 'object',
          properties: {
            videoId: { type: 'string' },
            maxResults: { type: 'number', default: 10 }
          },
          required: ['videoId']
        }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments as any;
  
  try {
    let result;
    switch (request.params.name) {
      case 'searchVideos':
        result = await searchVideos(args.query, args.maxResults, args.order);
        break;
      case 'getVideoDetails':
        result = await getVideoDetails(args.videoId);
        break;
      case 'getChannelInfo':
        result = await getChannelInfo(args.channelId);
        break;
      case 'getChannelVideos':
        result = await getChannelVideos(args.channelId, args.maxResults);
        break;
      case 'getPlaylistVideos':
        result = await getPlaylistVideos(args.playlistId, args.maxResults);
        break;
      case 'getTrendingVideos':
        result = await getTrendingVideos(args.regionCode, args.categoryId, args.maxResults);
        break;
      case 'getVideoComments':
        result = await getVideoComments(args.videoId, args.maxResults);
        break;
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
    
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } catch (error) {
    throw new Error(`Error calling tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Start Express server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\x1b[32m✓ YouTube MCP Server running on http://localhost:${PORT}\x1b[0m`);
    if (!hasAuth) {
      console.log(`\x1b[33m⚠ Warning: No authentication configured. API calls will fail.`);
      console.log(`\x1b[33m   Get your API key from: https://console.cloud.google.com/\x1b[0m`);
      console.log(`\x1b[33m   Or use OAuth client secret file for authentication.\x1b[0m`);
    }
  });
}

