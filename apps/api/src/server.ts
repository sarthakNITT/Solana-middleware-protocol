import { serve } from "bun";

serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/health") {
            return new Response(
                JSON.stringify({
                    status: "ok",
                    service: "sendra-api",
                    timestamp: Date.now(),
                }),
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        if (url.pathname === "/debug") {
            return new Response(
                JSON.stringify({
                    message: "Sendra API is running",
                }),
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log("Sendra API running on http://localhost:3000");