# 🏗️ System Architecture

OptiQuery Linter is built using a modular, decoupled approach inspired by **Hexagonal Architecture (Ports and Adapters)**. The primary goal of this design is to separate the core linting logic from the specific programming languages, ORMs, and output formats.

## Core Philosophy

The system is divided into four distinct layers:

1. **Core Engine (`src/core/`)**: The central brain. It knows nothing about TypeScript, Prisma, or the terminal. It defines the strict interfaces (Contracts) for Rules and Reporters, iterates over an abstract syntax tree (AST), and aggregates issues.
2. **Parsers (`src/parsers/`)**: The input adapters. Currently, the `TypeScriptParser` wraps `ts-morph` to read `.ts` files and convert them into an AST that the Core Engine can process. 
3. **Plugins / Rules (`src/plugins/`)**: The business logic. Each rule (e.g., Prisma N+1) is an independent module that complies with the `LinterRule` interface. Rules traverse the AST looking for specific anti-patterns.
4. **Reporters (`src/reporters/`)**: The output adapters. They receive a standardized array of issues from the Core Engine and format them for the end-user (e.g., standard output via `ConsoleReporter` or CI/CD integration via `JsonReporter`).

## Extensibility

By strictly adhering to the Single Responsibility Principle (SRP) and the Plugin Pattern, adding support for a new ORM (like TypeORM) or a new output format (like an HTML Reporter) requires zero modifications to the Core Engine.