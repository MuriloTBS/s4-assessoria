from PIL import Image
import base64
import io


def image_to_base64_under_limit(image_path: str, max_mb: float = 5.0, quality: int = 85) -> str:
    img = Image.open(image_path).convert("RGB")
    max_bytes = int(max_mb * 1024 * 1024)
    scale = 1.0

    while True:
        w = int(img.width * scale)
        h = int(img.height * scale)
        resized = img.resize((w, h), Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        resized.save(buffer, format="JPEG", quality=quality)
        data = buffer.getvalue()

        size_mb = len(data) / 1024 / 1024
        print(f"Tentativa scale={scale:.2f} → {w}x{h} → {size_mb:.2f}MB")

        if len(data) <= max_bytes:
            print(f"OK: {size_mb:.2f}MB (limite: {max_mb}MB)")
            return base64.b64encode(data).decode()

        scale *= 0.9
        if scale < 0.1:
            raise ValueError("Não foi possível comprimir a imagem abaixo do limite.")


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "sua_imagem.png"
    result = image_to_base64_under_limit(path)
    print(f"\nBase64 gerado: {len(result) / 1024 / 1024:.2f}MB")
