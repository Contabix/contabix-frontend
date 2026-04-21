/* =====================================
   GST State Codes
===================================== */

export const GST_STATE_CODES: Record<string, string> = {
  "jammu & kashmir": "1",
  "himachal pradesh": "2",
  "punjab": "3",
  "chandigarh": "4",
  "uttarakhand": "5",
  "haryana": "6",
  "delhi": "7",
  "rajasthan": "8",
  "uttar pradesh": "9",
  "bihar": "10",
  "sikkim": "11",
  "arunachal pradesh": "12",
  "nagaland": "13",
  "manipur": "14",
  "mizoram": "15",
  "tripura": "16",
  "meghalaya": "17",
  "assam": "18",
  "west bengal": "19",
  "jharkhand": "20",
  "odisha": "21",
  "chhattisgarh": "22",
  "madhya pradesh": "23",
  "gujarat": "24",
  "daman & diu": "25",
  "dadra & nagar haveli": "26",
  "maharashtra": "27",
  "andra pradesh (old)": "28",
  "karnataka": "29",
  "goa": "30",
  "lakshadweep": "31",
  "kerala": "32",
  "tamil nadu": "33",
  "puducherry": "34",
  "andaman & nicobar islands": "35",
  "telangana": "36",
  "andhra pradesh": "37",
  "ladakh": "38",
};

export function getGSTStateCode(state: string) {
  return GST_STATE_CODES[state.trim().toLowerCase()] ?? "";
}
