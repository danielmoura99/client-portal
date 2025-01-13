interface Window {
  pandascripttag: Array<() => void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PandaPlayer: new (id: string, options?: any) => any;
}
