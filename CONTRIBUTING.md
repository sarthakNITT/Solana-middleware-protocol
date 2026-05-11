# Contributing to Sendra

Thank you for your interest in contributing to Sendra. As an infrastructure-grade project, we maintain high standards for code quality, testing, and reliability.

## Local Development Setup

Sendra is built using a **Turborepo monorepo** architecture and uses **Bun** as the primary package manager.

### Prerequisites
- [Bun](https://bun.sh) (v1.2.19 or higher)
- [Node.js](https://nodejs.org) (v18 or higher)
- A Solana development environment (Devnet RPC suggested)

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/sarthakNITT/Solana-middleware-protocol.git
   cd Solana-middleware-protocol
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Run development mode:**
   ```bash
   bun dev
   ```
   This will start the documentation site, dashboard, and watch all internal packages for changes.

## Monorepo Structure

- `apps/`
  - `web`: Real-time transaction dashboard and execution simulator.
  - `docs`: Documentation site built with Next.js/Mintlify style.
  - `api`: Backend services for transaction orchestration.
  - `worker`: Background workers for confirmation monitoring.
- `packages/`
  - `sdk`: Main entry point for developers (`sendra-tx`).
  - `core`: The central orchestration logic (`sendWithReliability`).
  - `router`: RPC health monitoring and intelligent routing.
  - `retry-engine`: Adaptive backoff and state-aware retry logic.
  - `fee-optimizer`: Dynamic priority fee and CU limit calculation.
  - `simulator`: Pre-flight simulation and failure classification.
  - `logger`: High-fidelity execution telemetry and file-based logging.
  - `tx-builder`: Abstracted transaction construction for versioned transactions.

## Development Workflow

### Branching Policy
- `main`: Production-ready code.
- `dev`: Integration branch for upcoming releases.
- Feature branches: `feat/feature-name`, `fix/bug-name`.

### Coding Standards
- **TypeScript**: Strict mode is required for all packages.
- **Linting**: Run `bun lint` before committing.
- **Formatting**: Run `bun format` to ensure consistent code style.
- **Documentation**: All new exports must include JSDoc comments.

### Commit Guidelines
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance

## Pull Request Process
1. Ensure all tests pass (`bun check-types`).
2. Update the `README.md` or relevant documentation if changes affect the public API.
3. Provide a clear description of the changes and link any related issues.
4. Once approved, the maintainers will squash and merge into `main`.

## Code of Conduct
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.
