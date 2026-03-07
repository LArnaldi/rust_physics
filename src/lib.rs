use serde::Serialize;

#[derive(Serialize)]
pub struct Vector2D{
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize)]
pub struct Body{
    pub mass: f64,
    pub position: Vector2D,
    pub velocity: Vector2D,
    pub acceleration: Vector2D,
}


impl Body{
    pub fn new(mass: f64, position: Vector2D) -> Self {
        Body {
            mass,
            position,
            velocity : Vector2D { x: 0.0, y: 0.0 },
            acceleration: Vector2D { x: 0.0, y: 0.0 },
        }
    }

    pub fn apply_force(&mut self, force_x: f64, force_y: f64){
        self.acceleration.x += force_x / self.mass;
        self.acceleration.y += force_y / self.mass;
    }

    pub fn apply_drag(&mut self, k:f64){
        let force_x = -k * self.velocity.x;
        let force_y = -k * self.velocity.y;
        self.apply_force(force_x, force_y);
    }

    pub fn update(&mut self, dt: f64){
        self.velocity.x += self.acceleration.x * dt;
        self.velocity.y += self.acceleration.y * dt;
        self.position.x += self.velocity.x * dt;
        self.position.y += self.velocity.y * dt;
        self.acceleration.x = 0.0;
        self.acceleration.y = 0.0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gravity_fall() {
        let mut ball = Body::new(1.0, Vector2D { x: 0.0, y: 100.0 }); // 1kg, posizione (0, 100)
        let gravity_force_y = -9.81; // Forza peso: F = m * g (con m=1)
        let dt = 1.0; // Simuliamo un secondo intero

        ball.apply_force(0.0, gravity_force_y); 
        ball.update(dt);

        // Dopo 1 secondo:
        // a = -9.81 / 1.0 = -9.81
        // v = 0 + (-9.81 * 1.0) = -9.81
        // s = 100 + (-9.81 * 1.0) = 90.19
        
        assert!((ball.position.y - 90.19).abs() < 0.001);
        assert!((ball.velocity.y - (-9.81)).abs() < 0.001);
    }

    #[test]
fn test_drag_effect() {
    let mut ball = Body::new(1.0, Vector2D { x: 0.0, y: 0.0 });
    ball.velocity.x = 10.0; // La palla parte veloce verso destra
    
    // Applichiamo un coefficiente di attrito
    ball.apply_drag(0.5); 
    ball.update(1.0);

    // Senza attrito, dopo 1s la velocità sarebbe ancora 10.0.
    // Con l'attrito deve essere calata.
    assert!(ball.velocity.x < 10.0, "La velocità dovrebbe essere diminuita a causa del drag");
    assert!(ball.velocity.x > 0.0, "L'attrito non dovrebbe aver invertito la marcia");
}
}