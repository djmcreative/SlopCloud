# SlopCloud ☁️

The Sloppy Joes music site. It's plain HTML, CSS and JavaScript with no build step, made for GitHub Pages.

It has two tabs:
- **Songs:** the featured songs at the top, then every other song.
- **Write It Down:** an open message board. Anyone can post, upvote and comment without logging in.

Every song has share links: one opens the song on SlopCloud, and one points straight at the MP3 so it plays in VLC, Discord, iMessage or any other player.

---

## Adding or changing songs
- MP3s go in `music/songs/` and square cover images (about 800px JPG) in `music/covers/`.
- List each song in **`music.js`**, newest first:
  ```js
  { n: 18, id: "new-song", title: "New Song", file: "music/songs/18-new-song.mp3", cover: "music/covers/new-song.jpg", new: true },
  ```
- `new: true` features a song at the top. Keep it on 3 songs; the first one gets the big card.
- `id` is what share links use (`…/#/song/new-song`). Don't change it after people have shared a link.
- Song lengths are read from the files automatically.

The original WAVs and full-size art are in `new-songs/`. `.gitignore` keeps that folder off GitHub.

## Message board (Supabase)
The board saves posts in a free Supabase database. The project URL and publishable key are already in `music.js`.

The SQL lives in the `supabase/` folder. To run a file, open Supabase → **SQL Editor**, paste the file's contents and click **Run**.
1. `1-notes.sql` creates the posts table (already done).
2. `2-upvotes-and-comments.sql` adds upvotes and comments. Until it's run, the board still works but has no vote or comment buttons.

Visitors can only read, post, comment and change a vote count by one. They can't edit or delete anything. Each browser can upvote a post once, and tapping again removes the vote. This stops casual repeat voting, but it isn't strict: someone could clear their browser data and vote again.

**Removing posts or comments:** in Supabase open **Table Editor → notes** (or **comments**) and delete the row. Deleting a post also deletes its comments.

## Putting it on GitHub Pages
1. Create a new **public** repository on GitHub, e.g. `slopcloud`.
2. Upload everything in this folder **except `new-songs/`**, or use:
   ```bash
   git init
   git add .
   git commit -m "SlopCloud"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/slopcloud.git
   git push -u origin main
   ```
3. Go to **Settings → Pages**. Choose **Deploy from a branch**, then **main** and **/ (root)**, and click Save.
4. After a minute it's live at `https://YOUR-USERNAME.github.io/slopcloud/`.

## Install it like an app
- **iPhone (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** ⋮ → *Add to Home screen*

## Testing on your computer
```bash
npx http-server -p 8080
```
Then open http://localhost:8080.
