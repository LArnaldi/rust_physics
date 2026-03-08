use rust_physics::{Body, Vector2D};

fn main() {
    // Initial conditions: 1 kg body launched from the origin
    // with v_x = 10 m/s (horizontal) and v_y = 10 m/s (upward).
    let mut body = Body::new(1.0, Vector2D { x: 0.0, y: 0.0 });
    body.velocity = Vector2D { x: 10.0, y: 10.0 };

    let mut trajectory: Vec<Vector2D> = Vec::new();

    // Simulate 100 steps of dt = 0.1 s  →  10 seconds of flight.
    for _ in 0..100 {
        // Gravity: constant downward force F = m·g = 1·9.81 N.
        // Negative because the y-axis points upward.
        body.apply_force(Vector2D::new(0.0, -9.81));

        // Linear drag: F_drag = -k·v with k = 0.1 N·s/m.
        // Opposes motion on both axes, dissipating kinetic energy.
        body.apply_drag(0.1);

        // Euler integration: advances position and velocity by dt = 0.1 s.
        body.update(0.1);

        trajectory.push(Vector2D {
            x: body.position.x,
            y: body.position.y,
        });
    }

    // Serialize the trajectory to JSON and print to stdout.
    // Redirect with `cargo run > trajectory.json` to capture the file.
    let json = serde_json::to_string_pretty(&trajectory).unwrap();
    println!("{}", json);
}
