# Logger Usage

Shows how to consume Sendra execution logs in your application and where to find Sendra file logs after a run.

Sendra emits structured lifecycle events and also writes execution traces into `sendra-logs/` from the current working directory.

## Install

```bash
cd examples/logger-usage
cp .env.example .env
bun install
```

## Run

```bash
bun run dev
```

After execution, inspect generated file logs:

```bash
ls sendra-logs
cat sendra-logs/*.log
```

## What This Demonstrates

- Structured logger callback usage
- Retry and failure-classification events
- Confirmation logs
- Explorer link output
- File persistence in `sendra-logs/`

## Log Architecture

Your application receives each `LogEvent` through the `logger` callback. Sendra also creates a file logger internally, which is useful for support tickets, audit trails, and postmortems.
