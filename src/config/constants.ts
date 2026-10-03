export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
] as const;

export const TOKEN_KEY = "auth_token";

export const URGENCY_LEVELS = ["Normal", "Urgent", "Critical"] as const;
export const REQUEST_STATUSES = ["open", "fulfilled", "expired"] as const;

// patient blood group -> donor groups that can give to them (same table as the API)
export const COMPATIBLE_DONORS: Record<(typeof BLOOD_GROUPS)[number], readonly (typeof BLOOD_GROUPS)[number][]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

// days a donor must wait after donating (same value as the API)
export const DONATION_GAP_DAYS = 90;
