"""Renders the recorded readings in public/narration/ with Kokoro, an open-source
text-to-speech model that runs locally.

    pip install kokoro-onnx soundfile
    # model files from https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
    node tools/narration.mjs > /tmp/narration.json
    python tools/narrate.py /tmp/narration.json path/to/kokoro-v1.0.onnx path/to/voices-v1.0.bin

Only lines whose text changed are re-rendered (a hash of each is kept in index.json).
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = 'bf_emma'  # a British woman's voice, for Elara Voss
SPEED = 0.92
PARAGRAPH_PAUSE = 0.55  # seconds of silence between paragraphs
OUT = Path(__file__).resolve().parent.parent / 'public' / 'narration'


def main(lines_path, model, voices):
    lines = json.loads(Path(lines_path).read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    index_path = OUT / 'index.json'
    index = json.loads(index_path.read_text()) if index_path.exists() else {}
    kokoro = Kokoro(model, voices)
    for line_id, text in lines.items():
        key = hashlib.sha1(f'{VOICE}|{SPEED}|{text}'.encode()).hexdigest()
        target = OUT / f'{line_id}.mp3'
        if index.get(line_id) == key and target.exists():
            continue
        parts = []
        rate = 24000
        for paragraph in text.split('\n\n'):
            samples, rate = kokoro.create(paragraph, voice=VOICE, speed=SPEED, lang='en-gb')
            parts += [samples, np.zeros(int(rate * PARAGRAPH_PAUSE), dtype=samples.dtype)]
        audio = np.concatenate(parts)
        audio = audio / max(1e-6, float(np.abs(audio).max())) * 0.9
        sf.write(target, audio, rate, format='MP3')
        index[line_id] = key
        print(f'{line_id}: {len(audio) / rate:.1f}s')
    for stale in set(index) - set(lines):
        (OUT / f'{stale}.mp3').unlink(missing_ok=True)
        del index[stale]
    index_path.write_text(json.dumps(index, indent=2) + '\n')


if __name__ == '__main__':
    main(*sys.argv[1:4])
