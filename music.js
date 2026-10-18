/* ==========================================================
   SlopCloud: THE SLOPPY JOES CATALOGUE
   ----------------------------------------------------------
   Songs live in  music/songs/   (MP3)
   Covers live in music/covers/  (square JPG, ~800px)

   Songs are listed newest first. "n" is the song's number
   (1 = oldest). Songs with  new: true  are featured at the top;
   the first one gets the big card.

   A song with file: "" is hidden until you add its audio.
   ========================================================== */

window.SLOPCLOUD = {
  artist: "Sloppy Joes",

  // Cover used when a song doesn't have its own
  cover: "music/covers/default.svg",

  // ---------------- Songs (newest first) ----------------
  // id is used in share links. Keep it the same if you rename a song,
  // so links people already shared keep working.
  songs: [
    { n: 17, id: "his-pants-are-full",     title: "His Pants Are Full",      file: "music/songs/17-his-pants-are-full.mp3",     cover: "music/covers/his-pants-are-full.jpg", new: true },
    { n: 16, id: "deaning-pains-i",        title: "Deaning Pains I",         file: "music/songs/16-deaning-pains-i.mp3",        cover: "music/covers/deaning-pains-i.jpg", new: true },
    { n: 15, id: "deaner-man",             title: "Deaner Man",              file: "music/songs/15-deaner-man.mp3",             cover: "music/covers/deaner-man.jpg", new: true },
    { n: 14, id: "joes-in-paris",          title: "Joe's In Paris",          file: "music/songs/14-joes-in-paris.mp3",          cover: "music/covers/joes-in-paris.jpg" },
    { n: 13, id: "hes-a-daddy-i-can-tell", title: "He's A Daddy I Can Tell", file: "music/songs/13-hes-a-daddy-i-can-tell.mp3", cover: "music/covers/hes-a-daddy-i-can-tell.jpg" },
    { n: 12, id: "poopular-raw",           title: "Poopular (RAW)",          file: "music/songs/12-poopular-raw.mp3",           cover: "music/covers/poopular.jpg" },
    { n: 11, id: "poopular",               title: "Poopular",                file: "music/songs/11-poopular.mp3",               cover: "music/covers/poopular.jpg" },
    { n: 10, id: "cleats-for-wings",       title: "When A Sloppy Boy Trades His Cleats for Wings", file: "music/songs/10-cleats-for-wings.mp3", cover: "music/covers/cleats-for-wings.jpg" },
    { n: 9,  id: "deanin-problem",         title: "Deanin' Problem",         file: "music/songs/09-deanin-problem.mp3",         cover: "music/covers/deanin-problem.jpg" },
    { n: 8,  id: "a-joe-worth-deanin-for", title: "A Joe Worth Deanin For",  file: "music/songs/08-a-joe-worth-deanin-for.mp3", cover: "music/covers/a-joe-worth-deanin-for.jpg" },
    { n: 7,  id: "drunk-creed-freestyle",  title: "Drunk Creed Freestyle",   file: "music/songs/07-drunk-creed-freestyle.mp3",  cover: "music/covers/drunk-creed-freestyle.jpg" },
    { n: 6,  id: "skiing-hoes-ii",         title: "Skiing Hoes II",          file: "music/songs/06-skiing-hoes-ii.mp3",         cover: "music/covers/skiing-hoes-ii.jpg" },
    { n: 5,  id: "sloppy-remains",         title: "Sloppy Remains",          file: "music/songs/05-sloppy-remains.mp3",         cover: "music/covers/sloppy-remains.jpg" },
    { n: 4,  id: "skiing-hoes",            title: "Skiing Hoes",             file: "music/songs/04-skiing-hoes.mp3",            cover: "music/covers/skiing-hoes.jpg" },
    { n: 3,  id: "beastie-joes",           title: "Beastie Joes",            file: "music/songs/03-beastie-joes.mp3", cover: "music/covers/beastie-joes.jpg" },
    { n: 2,  id: "sloppy-joes",            title: "Sloppy Joes",             file: "music/songs/02-sloppy-joes.mp3",            cover: "music/covers/sloppy-joes.jpg" },
    { n: 1,  id: "sleepy-joe",             title: "Sleepy Joe",              file: "music/songs/01-sleepy-joe.mp3", cover: "music/covers/sleepy-joe.jpg" },  
  ],

  // ---------------- Write It Down: message board database (Supabase) ----------------
  notes: {
    supabaseUrl: "https://pcayhgcgpuliaclarzve.supabase.co",
    supabaseKey: "sb_publishable_-BJEUTA5xcxhAOZMt00Tyg_KOeWFpx9",   // publishable key (safe to be public); never the secret key
  },
};
