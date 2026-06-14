# v039_34 suspect overwrite files

## 目的
storySprites が効かない / 立ち絵が表示されない / 黒フラッシュが残る場合に、
怪しいファイルだけをまとめて上書きするためのミニ差分です。

## 上書き対象
- index.html
- program/v039/state.js
- program/v039/storyPlayer.js
- program/v039/layers.js
- program/v039/core.css
- scenario/v039/events/ai_spring_book_bread.json
- scenario/v039/events/hina_spring_bento.json
- program/docs/v039_34_audit.json

## 確認ポイント
DevTools の Network で以下が v039_34 として読み込まれているか確認してください。

- program/v039/storyPlayer.js?v=v039_34
- program/v039/layers.js?v=v039_34
- program/v039/core.css?v=v039_34

DOMで以下が生成されているか確認してください。

- .tenotsu-story-character-layer
- .tenotsu-story-standing
- img[src*="b10501.webp"]
- img[src*="a10501.webp"]

## 注意
リポジトリ直下へ展開して上書きしてください。
