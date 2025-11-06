import axios from 'axios';

export interface GdacsEvent {
  eventid: string;
  eventname: string;
  fromdate?: string;
  todate?: string;
  episodeid?: number;
  lat?: number;
  lon?: number;
  magnitude?: number;
  alertlevel?: string; // Green/Orange/Red
}

export interface GdacsResponse {
  features?: Array<{
    properties?: GdacsEvent;
    geometry?: { type: string; coordinates?: [number, number] };
  }>;
}

const client = axios.create({ timeout: 15000 });

// Fetch active tropical cyclone events
export async function getActiveCyclones() {
  const url = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC';
  const { data } = await client.get<GdacsResponse>(url, { params: { alertlevel: 'Green,Orange,Red' } });
  return data;
}

export default { getActiveCyclones };



