"""The old-cartoon finish on a composed RGB frame (Pillow + numpy):
soften the ink ~1 px, unsharp (radius 5, 60 %) so each stroke gets a faint pale rim, slow mottling on the flat fills,
colour channels blurred more than brightness and shifted 2 px off-register, gentle bloom, a warm tone, blacks lifted to
deep brown, a light vignette, fine grain in brightness only. Captions are burned on AFTER this, so text stays crisp."""
import numpy as np
from PIL import Image, ImageFilter


def _blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), dtype=np.float32)


def finish(img: Image.Image, frame: int = 0, scale: float = 1.0) -> Image.Image:
    s = scale
    im = img.convert('RGB').filter(ImageFilter.GaussianBlur(0.7 * s)).filter(ImageFilter.UnsharpMask(radius=5 * s, percent=60, threshold=0))
    a = np.asarray(im, dtype=np.float32)
    h, w, _ = a.shape
    # YCbCr: chroma blurred more than luma and shifted 2 px off-register
    Y = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    Cb = (a[..., 2] - Y) * 0.564 + 128
    Cr = (a[..., 0] - Y) * 0.713 + 128
    sh = max(1, int(round(2 * s)))
    Cb = np.roll(_blur(Cb, 2.2 * s), sh, axis=1)
    Cr = np.roll(_blur(Cr, 2.2 * s), -sh, axis=1)
    # slow mottling of the flat fills (low-frequency noise, drifts slowly with the frame)
    rs = np.random.RandomState(1234 + frame // 6)
    m = rs.rand(max(2, h // 160), max(2, w // 160)).astype(np.float32)
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), dtype=np.float32) / 255
    Y = Y * (0.975 + 0.05 * m)
    # back to RGB
    R = Y + 1.403 * (Cr - 128)
    G = Y - 0.344 * (Cb - 128) - 0.714 * (Cr - 128)
    B = Y + 1.773 * (Cb - 128)
    a = np.stack([R, G, B], -1)
    # gentle bloom on the brights
    br = np.clip(a - 200, 0, 255) * 1.6
    a = a + _blur(br, 14 * s) * 0.35
    # warm tone, blacks lifted to deep brown
    a[..., 0] *= 1.03
    a[..., 2] *= 0.95
    brown = np.array([38, 22, 16], np.float32)
    dark = np.clip(1 - a.mean(-1, keepdims=True) / 90, 0, 1)
    a = a * (1 - 0.35 * dark) + brown * 0.35 * dark
    # light vignette
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h * 0.46) / (h * 0.62)) ** 2)
    a *= (1 - 0.28 * np.clip(d - 0.55, 0, 1) ** 1.4)[..., None]
    # fine grain in brightness only
    g = np.random.RandomState(frame).randn(h, w).astype(np.float32) * 4.0
    a += g[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
