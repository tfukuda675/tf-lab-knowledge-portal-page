/* 社内資料の掲載例。url: null は遷移先が未設定のサンプルです。 */
window.PORTAL_DATA = {
  categories: [
    { id: 'onboarding', name: 'オンボーディング', icon: 'compass', color: 'teal', description: 'チームを知る、仕事を始める' },
    { id: 'operations', name: '業務・手順', icon: 'clipboard', color: 'blue', description: '日々の仕事をスムーズに' },
    { id: 'technology', name: '技術・開発', icon: 'code', color: 'violet', description: 'つくるための知識と工夫' },
    { id: 'learning', name: 'スキル・学習', icon: 'book', color: 'orange', description: '学びを、次の力に' }
  ],
  resources: [
    { id: 'r1', title: 'チームハンドブック', description: '私たちのミッション、チーム体制、大切にしている価値観をまとめました。', category: 'onboarding', type: 'Wiki', tags: ['はじめに', 'チーム'], updated: '2026-11-06', owner: '部門運営', url: null },
    { id: 'r2', title: 'はじめての環境セットアップ', description: 'アカウント申請から必要なツールの導入まで、最初の準備をステップごとに。', category: 'onboarding', type: '手順書', tags: ['入門', '環境構築'], updated: '2026-11-05', owner: 'ITサポート', url: null },
    { id: 'r3', title: '情報セキュリティの基本', description: '資料の取り扱い、パスワード管理、困ったときの相談先を確認しましょう。', category: 'onboarding', type: '動画', tags: ['必修', 'セキュリティ'], updated: '2026-11-04', owner: 'ITサポート', url: null },
    { id: 'r4', title: '経費精算・申請ガイド', description: '申請に必要なもの、承認までの流れ、よくある質問をひとまとめに。', category: 'operations', type: '手順書', tags: ['申請', '経費'], updated: '2026-11-06', owner: '部門運営', url: null },
    { id: 'r5', title: 'プロジェクトの進め方', description: 'キックオフから振り返りまで、チーム共通の仕事の進め方を紹介します。', category: 'operations', type: '資料', tags: ['プロジェクト', '実践'], updated: '2026-11-02', owner: 'プロジェクト推進', url: null },
    { id: 'r6', title: 'Git・コードレビュー入門', description: 'ブランチの運用と、伝わりやすいレビューの書き方を学ぶためのガイド。', category: 'technology', type: 'Wiki', tags: ['Git', '開発'], updated: '2026-11-03', owner: '開発チーム', url: null },
    { id: 'r7', title: '開発環境構築ハンズオン', description: 'サンプルプロジェクトを動かしながら、開発環境の基本構成を理解します。', category: 'technology', type: '動画', tags: ['環境構築', 'ハンズオン'], updated: '2026-10-30', owner: '開発チーム', url: null },
    { id: 'r8', title: 'リリース前チェックリスト', description: '品質確認、関係者への連絡、リリース後の確認事項を順にチェック。', category: 'technology', type: '手順書', tags: ['リリース', '品質'], updated: '2026-10-28', owner: '開発チーム', url: null },
    { id: 'r9', title: '伝わるドキュメントの書き方', description: '読み手に合わせた構成と、情報を見つけやすくする文章の工夫。', category: 'learning', type: '資料', tags: ['ドキュメント', '基礎'], updated: '2026-10-31', owner: '人材育成', url: null },
    { id: 'r10', title: 'ナレッジ共有のはじめかた', description: 'チームの知識をカテゴリとラベルで整理する、Atlassian公式のガイドです（英語）。', category: 'learning', type: 'Web', tags: ['ナレッジ', '外部資料'], updated: '2026-10-25', owner: '公開参考資料', url: 'https://www.atlassian.com/software/confluence/resources/guides/best-practices/knowledge-base' },
    { id: 'r11', title: '議事録テンプレートと活用例', description: '決定事項と次のアクションが伝わる、議事録の基本フォーマット。', category: 'operations', type: 'Wiki', tags: ['会議', 'テンプレート'], updated: '2026-10-24', owner: 'プロジェクト推進', url: null },
    { id: 'r12', title: 'ふりかえりのファシリテーション', description: '学びを次の改善につなげる、振り返りの準備と進行のポイント。', category: 'learning', type: '動画', tags: ['チーム', '改善'], updated: '2026-10-22', owner: '人材育成', url: null }
  ],
  courses: [
    { id: 'c1', title: 'チームの一員になる', description: 'はじめまして、から始めよう。', label: '新しく参加した方へ', duration: '約45分', color: 'teal', icon: 'compass', steps: ['r1', 'r2', 'r3'] },
    { id: 'c2', title: '開発の基本を身につける', description: '環境構築から、最初のリリースへ。', label: '開発メンバー向け', duration: '約90分', color: 'blue', icon: 'code', steps: ['r7', 'r6', 'r8'] },
    { id: 'c3', title: '知識を伝える力を育てる', description: '自分の学びを、チームの資産に。', label: 'すべてのメンバーへ', duration: '約60分', color: 'orange', icon: 'book', steps: ['r9', 'r10', 'r12'] }
  ]
};
