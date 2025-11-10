export interface Point {
  x: number;
  y: number;
}

export interface HeadacheEntry {
  id: string;
  date: string;
  scale: number;
  medication: string[];
  points: {
    front: Point[];
    back: Point[];
  };
  notes: string;
}
