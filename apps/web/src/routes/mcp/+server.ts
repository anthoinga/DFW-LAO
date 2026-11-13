import { handleMcpRequest } from '#lib/server/mcp/server.ts';
import type { RequestHandler } from './$types';

const CORS = {
	'access-control-allow-origin': '*',
	'access-control-allow-headers': 'content-type, mcp-protocol-version, mcp-session-id, accept',
	'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS'
};

const withCors = async (response: Promise<Response>) => {
	const res = await response;
	const headers = new Headers(res.headers);
	for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
	return new Response(res.body, { status: res.status, headers });
};

/** Remote MCP server (streamable HTTP, stateless, read-only public data). */
export const POST: RequestHandler = ({ request }) => withCors(handleMcpRequest(request));
export const GET: RequestHandler = ({ request }) => withCors(handleMcpRequest(request));
export const DELETE: RequestHandler = ({ request }) => withCors(handleMcpRequest(request));
export const OPTIONS: RequestHandler = () => new Response(null, { headers: CORS });
