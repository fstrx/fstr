/**
 * "on rotation". Static for now — swap in a last.fm / spotify feed later
 * if you want it live. Artist + album only, no embeds, no lyrics.
 */
export type Track = { artist: string; album: string; year: number };

export const listening: Track[] = [
  { artist: "Deftones", album: "White Pony", year: 2000 },
  { artist: "Radiohead", album: "In Rainbows", year: 2007 },
  { artist: "Jeff Buckley", album: "Grace", year: 1994 },
];
