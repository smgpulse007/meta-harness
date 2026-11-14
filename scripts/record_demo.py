"""Record the real disposable CLI walkthrough as a terminal GIF; requires Pillow."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def font(size):
    for name in ['DejaVuSansMono.ttf', 'C:/Windows/Fonts/consola.ttf']:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


def main():
    result = subprocess.run(['node', 'scripts/demo.mjs'], cwd=ROOT, capture_output=True, text=True, encoding='utf-8', timeout=120)
    if result.returncode:
        raise RuntimeError('The real demonstration failed; no success recording written: ' + result.stderr)
    output = result.stdout + result.stderr
    lines = [part for line in output.splitlines() for part in (textwrap.wrap(line, 92) or [''])]
    frames, durations = [], []
    for count in range(1, len(lines) + 1):
        canvas = Image.new('RGB', (1080, 590), '#0c1220')
        draw = ImageDraw.Draw(canvas)
        draw.rounded_rectangle((18, 18, 1062, 572), radius=16, fill='#111d30', outline='#2b3f59', width=2)
        draw.text((40, 36), 'Meta Harness / real CLI walkthrough', font=font(23), fill='#e7eef8')
        draw.text((40, 79), '$ pnpm demo', font=font(19), fill='#7dd3fc')
        for index, line in enumerate(lines[:count][-17:]):
            draw.text((40, 120 + index * 23), line, font=font(17), fill='#a7f3d0' if line.startswith('$') else '#e1e9f5')
        draw.text((40, 544), 'Synthetic workspace  |  No agent dispatch  |  No package publication', font=font(15), fill='#91a4c0')
        frames.append(canvas)
        durations.append(3200 if count == len(lines) else 350)
    target = ROOT / 'docs/public/cli-demo.gif'
    target.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(target, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
    sources = ['scripts/demo.mjs', 'packages/cli/src/commands/init.ts', 'packages/cli/src/index.ts']
    metadata = {'recorded_utc': datetime.now(timezone.utc).isoformat(), 'kind': 'animation_rendered_from_actual_command_output',
                'command': 'node scripts/demo.mjs (after pnpm build)', 'exit_code': result.returncode, 'output': output,
                'source_hash_format': 'UTF-8 bytes with CRLF normalized to LF, matching Git blobs',
                'source_sha256': {name: hashlib.sha256((ROOT / name).read_bytes().replace(b'\r\n', b'\n')).hexdigest() for name in sources},
                'gif_sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    (ROOT / 'docs/demo-recording.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    print(f'Recorded {target.name}: {target.stat().st_size} bytes from actual CLI output.')


if __name__ == '__main__':
    main()
