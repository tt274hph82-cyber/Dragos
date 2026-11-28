"""A tiny perspective camera for the sets: worlds are built in metres and projected to the 2x frame (2160 x 3840).
X right, Y up, Z away from the camera. Light shapes are cast geometrically along a sun direction."""
import math


class Cam:
    def __init__(self, f=1250.0, cx=1080.0, horizon=1700.0, eye=1.55, x=0.0, z=0.0, yaw=0.0):
        self.f, self.cx, self.hz, self.eye, self.x, self.z, self.yaw = f, cx, horizon, eye, x, z, yaw

    def p(self, X, Y, Z):
        """world point -> screen point (2x units)"""
        x, z = X - self.x, Z - self.z
        c, s = math.cos(self.yaw), math.sin(self.yaw)
        x, z = x * c - z * s, x * s + z * c
        z = max(z, 0.05)
        return (self.cx + x * self.f / z, self.hz - (Y - self.eye) * self.f / z)

    def poly(self, pts3):
        return [self.p(*q) for q in pts3]

    def scale(self, Z):
        """pixels per metre at depth Z"""
        return self.f / max(Z - self.z, 0.05)


def cast_to_plane(pt, d, axis, value):
    """slide a 3D point along direction d until coordinate `axis` (0 X, 1 Y, 2 Z) equals value"""
    t = (value - pt[axis]) / d[axis]
    return tuple(pt[i] + d[i] * t for i in range(3))
