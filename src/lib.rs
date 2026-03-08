use std::ops::{Add, AddAssign, Mul};
use serde::Serialize;

/// A 2D vector used to represent positions, velocities, and forces.
/// Components are in SI units (metres, m/s, Newtons) depending on context.
#[derive(Serialize, Clone, Copy, Debug, PartialEq)]
pub struct Vector2D {
    pub x: f64,
    pub y: f64,
}

/// A rigid body with mass, position, velocity, and acceleration.
/// All quantities follow SI units: kg, m, m/s, m/s².
#[derive(Serialize)]
pub struct Body {
    pub mass: f64,
    pub position: Vector2D,
    pub velocity: Vector2D,
    pub acceleration: Vector2D,
}

impl Vector2D {
    pub fn new(x: f64, y: f64) -> Self {
        Vector2D { x, y }
    }

    /// Returns the Euclidean length of the vector.
    ///
    /// Pythagorean theorem: |v| = sqrt(x² + y²)
    pub fn magnitude(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }

    /// Returns a new vector with the same direction but a length of 1.
    /// If the original vector has zero length, returns a zero vector to avoid division by zero.
    pub fn normalize(&self) -> Self {
        let mag = self.magnitude();
        if mag > 0.0 {
            Vector2D {
                x: self.x / mag,
                y: self.y / mag,
            }
        } else {
            Vector2D { x: 0.0, y: 0.0 }
        }
    }

    /// Returns the dot product of this vector with another.
    /// Dot product: v·w = v_x·w_x + v_y·w_y
    pub fn dot(&self, other: &Vector2D) -> f64 {
        self.x * other.x + self.y * other.y
    }
}

impl Add for Vector2D {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        Vector2D {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl AddAssign for Vector2D {
    fn add_assign(&mut self, other: Self) {
        self.x += other.x;
        self.y += other.y;
    }
}

impl Mul<f64> for Vector2D{
    type Output = Self;

    fn mul(self, scalar: f64) -> Self {
        Vector2D {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }
}

impl Body {
    /// Creates a body at rest (v = 0, a = 0) with the given mass and initial position.
    pub fn new(mass: f64, position: Vector2D) -> Self {
        Body {
            mass,
            position,
            velocity: Vector2D { x: 0.0, y: 0.0 },
            acceleration: Vector2D { x: 0.0, y: 0.0 },
        }
    }

    /// Accumulates acceleration from an applied force vector.
    ///
    /// Newton's Second Law: F = m·a  →  a = F / m  →  a = F · (1/m)
    ///
    /// Multiple forces can be applied per step; accelerations add up
    /// before `update()` integrates them.
    pub fn apply_force(&mut self, force: Vector2D) {
        self.acceleration += force * (1.0 / self.mass);
    }

    /// Applies a linear drag force opposing the current velocity.
    ///
    /// Linear drag model: F_drag = -k · v
    ///
    /// Valid at low Reynolds numbers (viscous/laminar flow).
    /// `k` is the drag coefficient [N·s/m].
    pub fn apply_drag(&mut self, k: f64) {
        self.apply_force(self.velocity * (-k));
    }

    /// Advances the simulation by one time step `dt` using Euler integration.
    ///
    /// Euler method (first-order):
    ///   v(t+dt) = v(t) + a(t) · dt
    ///   x(t+dt) = x(t) + v(t+dt) · dt
    ///
    /// Accumulated acceleration is reset to zero after each step so that
    /// forces must be re-applied every iteration (force-accumulator pattern).
    ///
    /// Note: Euler integration introduces error proportional to dt.
    /// Smaller dt → higher accuracy at the cost of more steps.
    pub fn update(&mut self, dt: f64) {
        self.velocity += self.acceleration * dt;
        self.position += self.velocity * dt;
        // Reset accumulator — forces must be applied again next step.
        self.acceleration = Vector2D::new(0.0, 0.0);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Verifies free fall under gravity for 1 second.
    ///
    /// Setup: 1 kg body at y=100 m, starts at rest.
    /// Applied force: F_y = -9.81 N  (weight = m·g, g = 9.81 m/s²)
    ///
    /// Expected after dt = 1 s:
    ///   a = F/m = -9.81 m/s²
    ///   v = 0 + a·dt = -9.81 m/s
    ///   y = 100 + v·dt = 90.19 m
    #[test]
    fn test_gravity_fall() {
        let mut ball = Body::new(1.0, Vector2D { x: 0.0, y: 100.0 });
        let gravity_force_y = -9.81; // Weight force: F = m·g (m = 1 kg)
        let dt = 1.0;

        ball.apply_force(Vector2D::new(0.0, gravity_force_y));
        ball.update(dt);

        assert!((ball.position.y - 90.19).abs() < 0.001);
        assert!((ball.velocity.y - (-9.81)).abs() < 0.001);
    }

    /// Verifies that linear drag reduces horizontal velocity without reversing it.
    ///
    /// Setup: 1 kg body with v_x = 10 m/s, drag coefficient k = 0.5 N·s/m.
    /// F_drag = -0.5 · 10 = -5 N  →  a = -5 m/s²
    ///
    /// After dt = 1 s:
    ///   v_x = 10 + (-5)·1 = 5 m/s  — slower but still positive.
    #[test]
    fn test_drag_effect() {
        let mut ball = Body::new(1.0, Vector2D { x: 0.0, y: 0.0 });
        ball.velocity.x = 10.0;

        ball.apply_drag(0.5);
        ball.update(1.0);

        assert!(ball.velocity.x < 10.0, "drag must slow the body down");
        assert!(ball.velocity.x > 0.0, "drag must not reverse the direction");
    }

    /// Verifies that the magnitude of a vector is calculated correctly.
    /// Setup: Vector with components (3, 4) should have magnitude 5 (3-4-5 triangle).
    /// Pythagorean theorem: |v| = sqrt(3² + 4²) = sqrt(9 + 16) = sqrt(25) = 5.
    /// This test confirms that the `magnitude()` method correctly implements the Euclidean norm.
    /// If this test fails, it indicates a bug in the `magnitude()` method, which could affect all physics calculations that rely on vector lengths (e.g., normalization, drag force calculations).
    #[test]
    fn test_vector_magnitude() {
        let v = Vector2D { x: 3.0, y: 4.0 };
        assert_eq!(v.magnitude(), 5.0);
    }
}
