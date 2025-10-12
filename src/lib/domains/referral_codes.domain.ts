export interface ReferralCode {
  $id?: string;
  code: string;
  createdBy?: string; // User profile ID of the admin who created this code
}
