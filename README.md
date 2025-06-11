# Actual Budget MCP Server

MCP server for integrating Actual Budget with Claude and other LLM assistants.

## Overview

The Actual Budget MCP Server allows you to interact with your personal financial data from [Actual Budget](https://actualbudget.com/) using natural language through LLMs. It exposes your accounts, transactions, and financial metrics through the Model Context Protocol (MCP).

## Features

### Resources
- **Account Listings** - Browse all your accounts with their balances
- **Account Details** - View detailed information about specific accounts
- **Transaction History** - Access transaction data with complete details

### Tools
- **`get-transactions`** - Retrieve and filter transactions by account, date, amount, category, or payee
- **`spending-by-category`** - Generate spending breakdowns categorized by type
- **`monthly-summary`** - Get monthly income, expenses, and savings metrics
- **`balance-history`** - View account balance changes over time
- **`create-rule`** - Create a categorization rule based on payee

### Prompts
- **`financial-insights`** - Generate insights and recommendations based on your financial data
- **`budget-review`** - Analyze your budget compliance and suggest adjustments

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Actual Budget](https://actualbudget.com/) installed and configured
- [Claude Desktop](https://claude.ai/download) or another MCP-compatible client

### Setup

1. Clone the repository:
```bash
git clone https://github.com/s-stefanov/mcp-actualbudget.git
cd mcp-actualbudget
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

4. Configure environment variables (optional):
```bash
# Path to your Actual Budget data directory (default: ~/.actual)
export ACTUAL_DATA_DIR="/path/to/your/actual/data"

# If using a remote Actual server
export ACTUAL_SERVER_URL="https://your-actual-server.com"
export ACTUAL_PASSWORD="your-password"

# Specific budget to use (optional)
export ACTUAL_BUDGET_SYNC_ID="your-budget-id"
```

## Running with Docker or Podman

You can also build and run the server in a container. From the project root build the image:

```bash
docker build -t actual-mcp .
# or with Podman
podman build -t actual-mcp .
```

### Running in stdio mode

Provide your Actual configuration via environment variables. In stdio mode (recommended for Claude Desktop) no ports need to be mapped:

```bash
docker run -i --rm \
  -e ACTUAL_DATA_DIR=/path/to/your/actual/data \
  actual-mcp
```
This command uses the container's default entrypoint, which starts the server in stdio mode.

### Running the SSE server

To expose an SSE endpoint for other clients, run the container with `--sse` and map the port:

```bash
docker run -it --rm \
  -e ACTUAL_DATA_DIR=/path/to/your/actual/data \
  -p 3000:3000 actual-mcp --sse
```

If connecting to a remote Actual server, set `ACTUAL_SERVER_URL` and `ACTUAL_PASSWORD` instead. Replace `docker` with `podman` in the commands if needed.

With the SSE server running, any MCP-compatible client can connect to `http://localhost:3000`. For example, a Claude Desktop configuration might look like:

```json
{
  "mcpServers": {
    "actualBudget": {
      "transport": "sse",
      "url": "http://localhost:3000"
    }
  }
}
```

## Usage with Claude Desktop

To use this server with Claude Desktop, add it to your configuration. If you are running the server directly with Node, use the following setup:

On MacOS:
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

On Windows:
```bash
code %APPDATA%\Claude\claude_desktop_config.json
```

Add the following to your configuration:
```json
{
  "mcpServers": {
    "actualBudget": {
      "command": "node",
      "args": ["/absolute/path/to/actual-budget-mcp/build/index.js"],
      "env": {
        "ACTUAL_DATA_DIR": "/path/to/your/actual/data"
      }
    }
  }
}
```

If you prefer to run the server through Docker or Podman, use a command-based configuration:

```json
{
  "mcpServers": {
    "actualBudget": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "ACTUAL_DATA_DIR=/path/to/your/actual/data",
        "actual-mcp"
      ]
    }
  }
}
```

Replace `docker` with `podman` if needed. After saving the configuration, restart Claude Desktop.

## Example Queries

Once connected, you can ask Claude questions like:

- "What's my current account balance?"
- "Show me my spending by category last month"
- "How much did I spend on groceries in January?"
- "What's my savings rate over the past 3 months?"
- "Analyze my budget and suggest areas to improve"

## Development

For development with auto-rebuild:
```bash
npm run watch
```

### Testing the connection to Actual

To verify the server can connect to your Actual Budget data:
```bash
node build/index.js --test-resources
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## Project Structure

- `index.ts` - Main server implementation
- `types.ts` - Type definitions for API responses and parameters
- `prompts.ts` - Prompt templates for LLM interactions
- `utils.ts` - Helper functions for date formatting and more

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
