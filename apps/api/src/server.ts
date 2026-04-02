import { HandleTx } from "./orchestrator";

Bun.serve({
    port: 3000,
    fetch: async (req) => {
        if (req.method === "POST" && new URL(req.url).pathname === "/tx") {
            const body = await req.json();

            const result = await HandleTx(body);

            return Response.json(result);
        }

        return new Response("Not Found", { status: 404 });
    },
});
