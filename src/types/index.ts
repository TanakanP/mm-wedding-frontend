export interface ScheduleItem {
  time: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
}

export interface InformationData {
  dateTh: string;
  locationTh: string;
  dateEn: string;
  locationEn: string;
  schedules: ScheduleItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
}
