export interface PosterImage {
  url: string;
  ref?: string;
  width?: number;
  height?: number;
  orientation?: "portrait" | "landscape" | "square";
}