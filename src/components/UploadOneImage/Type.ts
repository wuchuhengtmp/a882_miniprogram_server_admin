export interface ImgState {
  id: number;
  url: string;
}

export interface PropsState  {
  aspect? : number;
  imgUrl?: ImgState;
  isCut?: boolean;
  onChange?: (params: ImgState) => void;
  isRefresh?: number | false;
}
