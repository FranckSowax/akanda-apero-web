module.exports = {
  createMcpHandler: () => (req) => ({ status: 200, body: { message: "MCP Handler disabled for production" } }),
  createMcpServer: () => ({})
};
