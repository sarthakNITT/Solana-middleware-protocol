import { HandleTx } from "./orchestrator";

Bun.serve({
    port: 3002,
    fetch: async (req) => {
        if (req.method === "POST" && new URL(req.url).pathname === "/tx") {
            const body = await req.json();
            console.log(`Got body from request: ${body}`);
            const result = await HandleTx(body);
            return Response.json(result);
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running at port: 3002`);