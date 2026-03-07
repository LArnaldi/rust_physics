# rust_physics

A high-performance 2D physics engine written in Rust, built from scratch as part of a learning journey toward becoming a **Game Designer** and **Full-Stack System Architect**.

This project explores the fundamentals of real-time physics simulation — rigid body dynamics, numerical integration, and collision detection — with a focus on correctness, performance, and idiomatic Rust. It also serves as the backend core of a broader stack: Rust simulation → JSON export → React dashboard → Claude AI agent.

---

## Goals

- Implement a 2D physics engine using **Euler integration** as the foundational numerical method
- Build a solid understanding of the math and systems design behind game engines
- Develop fluency in Rust's ownership model, type system, and zero-cost abstractions
- Build a **React dashboard** to visualize simulation trajectories in real time
- Integrate a **Claude/LLM agent** to analyze simulation output and optimize physics parameters
- Serve as a portfolio piece demonstrating full-stack systems thinking and engineering discipline

---

## Roadmap

- [x] **Core Physics** — Euler integration, mass, forces (gravity, drag)
- [ ] **Math Primitives** — dot product, normalization, magnitude (Vec2)
- [ ] **React Visualization** — real-time trajectory dashboard consuming Rust output
- [ ] **AI Agent Integration** — Claude/LLM agent to analyze simulation data and tune physics parameters
- [ ] **Collision Detection** — AABB (Axis-Aligned Bounding Boxes)
- [ ] **Export System** — JSON / MessagePack output for Unity or Web integration

---

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (edition 2024, via `rustup`)

Verify your installation:

```bash
rustc --version
cargo --version
```

### Clone the repository

```bash
git clone https://github.com/LArnaldi/rust_physics.git
cd rust_physics
```

### Run the tests

```bash
cargo test
```

Expected output:

```
running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

---

## Project Structure

```
rust_physics/
├── Cargo.toml       # Package manifest and dependencies
└── src/
    └── lib.rs       # Library entry point
```

---

## Design Notes

### Why Euler Integration?

Euler integration is the simplest explicit numerical integration method: given position `x` and velocity `v` at time `t`, the next state is computed as:

```
v(t + dt) = v(t) + a(t) * dt
x(t + dt) = x(t) + v(t) * dt
```

It is not the most accurate method (compared to Verlet or Runge-Kutta), but it is an ideal starting point for understanding the simulation loop, and its limitations make it a great teaching tool for why more advanced integrators exist.

### Why Rust?

Rust provides memory safety without a garbage collector, making it well suited for real-time simulation where predictable performance matters. Its type system enforces correctness at compile time, which helps catch physics logic errors early.

### Why this stack?

The full pipeline is: **Rust** computes the simulation and exports trajectory data as JSON → **React** consumes that data to render live visualizations → a **Claude agent** reads the results and suggests parameter adjustments. Each layer is independently replaceable, which makes the architecture easy to extend (e.g. swapping the export format for MessagePack for Unity integration).

---

## License

MIT

---

> Part of an ongoing journey in game systems design and software architecture.
