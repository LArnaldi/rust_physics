use rust_physics::{Body, Vector2D};

fn main(){
    let mut body = Body::new(1.0, Vector2D { x: 0.0, y: 0.0 });
    body.velocity = Vector2D { x: 10.0, y: 10.0 };
    let mut trajectory: Vec<Vector2D> = Vec::new();
    for _ in 0..100 {
        body.apply_force(0.0, -9.81);
        body.apply_drag(0.1);
        body.update(0.1);
        trajectory.push(Vector2D { x: body.position.x, y: body.position.y });
    }

    let json = serde_json::to_string_pretty(&trajectory).unwrap();
    println!("{}", json);
}