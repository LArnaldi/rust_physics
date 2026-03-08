use rust_physics::{Body, Vector2D};
use serde::Serialize;

/// One recorded simulation step for the moving body.
#[derive(Serialize)]
struct Frame {
    x: f64,
    y: f64,
    /// True when the body's AABB overlapped the wall during this step.
    colliding: bool,
}

/// Static snapshot of a body's bounding box, written once in the output.
#[derive(Serialize)]
struct BodySnapshot {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

/// Root JSON object consumed by the visualizer.
#[derive(Serialize)]
struct SimOutput {
    /// Moving body — initial position and dimensions.
    body: BodySnapshot,
    /// Static wall — position and dimensions (never changes).
    wall: BodySnapshot,
    /// Per-step trajectory of the moving body.
    frames: Vec<Frame>,
}

fn main() {
    // Body: 1 kg, starts at origin, launched at v_x=25 m/s and v_y=8 m/s.
    // At v_x=25 the body reaches the wall in ~1.8 s, while still within
    // the wall's vertical extent — guaranteeing a visible collision.
    let mut body = Body::new(1.0, Vector2D::new(0.0, 0.0));
    body.velocity = Vector2D::new(25.0, 8.0);

    // Wall: immovable (mass=1000 kg), centred at x=50, y=0.
    // Height=200 m spans y∈[-100, 100], covering the full arc of the body
    // so the AABB check overlaps in Y at the moment of horizontal contact.
    let mut body_wall = Body::new(1000.0, Vector2D::new(50.0, 0.0));
    body_wall.width = 5.0;
    body_wall.height = 200.0;

    let body_initial = BodySnapshot {
        x: body.position.x,
        y: body.position.y,
        width: body.width,
        height: body.height,
    };

    let wall_snapshot = BodySnapshot {
        x: body_wall.position.x,
        y: body_wall.position.y,
        width: body_wall.width,
        height: body_wall.height,
    };

    let mut frames: Vec<Frame> = Vec::new();

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

        // AABB collision check and inelastic resolution.
        let colliding = body.collides_with(&body_wall);
        if colliding {
            body.resolve_collision(&body_wall);
        }

        frames.push(Frame {
            x: body.position.x,
            y: body.position.y,
            colliding,
        });
    }

    // Serialize the full simulation output to JSON and print to stdout.
    // Redirect with `cargo run 2>/dev/null > trajectory.json` to capture the file.
    let output = SimOutput {
        body: body_initial,
        wall: wall_snapshot,
        frames,
    };

    println!("{}", serde_json::to_string_pretty(&output).unwrap());
}
