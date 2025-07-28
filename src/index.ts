import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { Database } from './database.js';
import { LinkedInDataImporter } from './import-data.js';

class LinkedInMCPServer {
  private server: Server;
  private database: Database;

  constructor() {
    this.server = new Server(
      {
        name: 'linkedin-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.database = new Database();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_profile',
          description: 'Get LinkedIn profile information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_experience',
          description: 'Get work experience history',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_certifications',
          description: 'Get certifications and licenses',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_skills',
          description: 'Get skills and endorsements',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_recent_posts',
          description: 'Get recent LinkedIn posts',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of posts to retrieve (default: 10)',
                default: 10,
              },
            },
          },
        },
        {
          name: 'search_connections',
          description: 'Search connections by name, company, or headline',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_sync_status',
          description: 'Get last sync timestamp and status',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'import_data',
          description: 'Import data from JSON file (provide file path)',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to JSON file with LinkedIn data',
              },
            },
            required: ['filePath'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_profile':
            return await this.handleGetProfile();

          case 'get_experience':
            return await this.handleGetExperience();

          case 'get_certifications':
            return await this.handleGetCertifications();

          case 'get_skills':
            return await this.handleGetSkills();

          case 'get_recent_posts':
            return await this.handleGetRecentPosts(typeof args?.limit === 'number' ? args.limit : 10);

          case 'search_connections':
            if (!args?.query || typeof args.query !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Query parameter is required and must be a string');
            }
            return await this.handleSearchConnections(args.query);

          case 'get_sync_status':
            return await this.handleGetSyncStatus();

          case 'import_data':
            if (!args?.filePath || typeof args.filePath !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'filePath parameter is required and must be a string');
            }
            return await this.handleImportData(args.filePath);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
      }
    });
  }

  private async handleGetProfile() {
    const profile = await this.database.getProfile();
    
    if (!profile) {
      return {
        content: [
          {
            type: 'text',
            text: 'No profile data found. Please import your LinkedIn data first using the import_data tool or run: npm run import template',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(profile, null, 2),
        },
      ],
    };
  }

  private async handleGetExperience() {
    const experience = await this.database.getExperience();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(experience, null, 2),
        },
      ],
    };
  }

  private async handleGetCertifications() {
    const certifications = await this.database.getCertifications();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(certifications, null, 2),
        },
      ],
    };
  }

  private async handleGetSkills() {
    const skills = await this.database.getSkills();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(skills, null, 2),
        },
      ],
    };
  }

  private async handleGetRecentPosts(limit: number) {
    const posts = await this.database.getRecentPosts(limit);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(posts, null, 2),
        },
      ],
    };
  }

  private async handleSearchConnections(query: string) {
    const connections = await this.database.searchConnections(query);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(connections, null, 2),
        },
      ],
    };
  }

  private async handleGetSyncStatus() {
    const profile = await this.database.getProfile();
    const experience = await this.database.getExperience();
    const certifications = await this.database.getCertifications();
    const skills = await this.database.getSkills();
    const posts = await this.database.getRecentPosts(1);
    
    const status = {
      lastSync: profile?.updatedAt || 'Never',
      dataStatus: {
        profile: !!profile,
        experience: experience.length > 0,
        certifications: certifications.length > 0,
        skills: skills.length > 0,
        posts: posts.length > 0
      },
      counts: {
        experience: experience.length,
        certifications: certifications.length,
        skills: skills.length,
        posts: posts.length
      }
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }

  private async handleImportData(filePath: string) {
    try {
      const importer = new LinkedInDataImporter();
      await importer.importFromManualJSON(filePath);
      await importer.close();

      return {
        content: [
          {
            type: 'text',
            text: `Data imported successfully from: ${filePath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Import failed: ${error}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LinkedIn MCP server running on stdio');
  }

  async cleanup(): Promise<void> {
    await this.database.close();
  }
}

// Handle graceful shutdown
const server = new LinkedInMCPServer();

process.on('SIGINT', async () => {
  console.error('Shutting down LinkedIn MCP server...');
  await server.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down LinkedIn MCP server...');
  await server.cleanup();
  process.exit(0);
});

// Start the server
server.run().catch((error) => {
  console.error('Failed to run server:', error);
  process.exit(1);
});