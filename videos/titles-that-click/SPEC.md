# How to Write YouTube Titles People Can't Resist — spec

- Style: Liquid Glass (started from `videos/shorts-vs-long/`), with clearer, iPhone-style glass: lighter blur, strong specular rim,
  and crisp shapes (rings, balls, bars) drifting behind the panels so the transparency shows.
- Font: Inter, the same font as the previous Liquid Glass video (a free, close match to the iPhone system font).
- Voice: Kokoro af_heart at 0.92 (`script/make_voice.py`). Length 8:30.
- Example creator: Maya (cooking channel). On-screen numbers are labelled "illustrative".
- Build: `python3 -I script/make_voice.py` then `node build.mjs`. Scenes live in `src/scenes/`.
