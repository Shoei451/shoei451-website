# todo list on 451-docs
## md→htmlのビルドの最適化

### build_latest.jsの改修
mdの移動を伴う機能は必要ない(更新をかけたい際にmdファイルをdraft/ からposts/ に移す必要があり面倒)
- [ ] draft/ のファイルに変更があった際のビルドで記事生成
- [ ] slug指定での記事表示に移行し、htmlファイルを一枚で済ませる
- [ ] slug指定方式の導入で、公開記事生成の一部ロジック(目次生成など)を共通化することができる
- [ ] 保守コストも抑えることができる(デザインの変化など)
### Github Actionsへの応用
- [ ] package.json+ Github workflow

## blogとしての本格的運用
- [ ] RSSの整備
## セキュリティ
現在のパスワード付き記事は、supabase anonkeyとRLSによる制御ロジックを持っている。つまりpasswordは見せかけでしかない。Edge Functionを用いた改善が必要。
- [ ] 過去にedge functionについて話したチャットがあるはずなので探す
検討の結果、mdコンテンツは別のprivateレポジトリに保存し、451-docs/ レポジトリには置かず、netlifyでのビルド時に追加することに決定。これによりEdge functionを利用してパスワード付きの記事をsupabaseに依存することなく保護できる。
## その他：今後のサイト運営のために
- [ ] 不要ファイルの削除とアーカイブ
- [ ] ファイル命名方式の改善(js/config.jsでは何のconfigか不明瞭)
- [ ] jsファイルの共通化(部品として)
- [ ] filetree.md自動ビルド(Github Actionsでの実装、451-websiteからのコピペで済む)
- [ ] デザインとロジックの輸出：視認性・操作性の高いUIを使い回せるようにする。(既にClaudeのスキルファイルにあるcomponents.htmlを拡張予定)
---
以上の作業を、最もコストの少ない順番で実行する。

---

## 事後処理
- [ ] READMEの更新