# rust_physics

A high-performance 2D physics engine written in Rust, built from scratch as part of a learning journey toward becoming a **Game Designer** and **System Architect**.

This project explores the fundamentals of real-time physics simulation — rigid body dynamics, numerical integration, and collision detection — with a focus on correctness, performance, and idiomatic Rust.

---

## Goals

- Implement a 2D physics engine using **Euler integration** as the foundational numerical method
- Build a solid understanding of the math and systems design behind game engines
- Develop fluency in Rust's ownership model, type system, and zero-cost abstractions
- Serve as a portfolio piece demonstrating low-level systems thinking and engineering discipline

---

## Roadmap

- [x] Project scaffolding
- [ ] Vec2 math primitives (dot product, normalization, magnitude)
- [ ] Rigid body representation (position, velocity, acceleration, mass)
- [ ] Euler integration step
- [ ] AABB collision detection
- [ ] Collision response and impulse resolution
- [ ] Broadphase optimization

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

---

## License

MIT

---

> Part of an ongoing journey in game systems design and software architecture.
