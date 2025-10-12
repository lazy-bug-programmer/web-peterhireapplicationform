export interface Form {
  $id?: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  nationality: string;
  gender: FormGender;
  requirement: boolean;
  ref_code_id: string;
  submitted_at: Date;
  status: FormStatus;
  has_view: boolean;
}

export enum FormStatus {
  SUBMITTED = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export enum FormGender {
  MALE = 0,
  FEMALE = 1,
}
