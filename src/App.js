import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

export default function App() {
  const [visitData, setVisitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const visitId = getQueryParam('id');

  useEffect(() => {
    if (!visitId) return;

    const fetchVisitData = async () => {
      const { data, error } = await supabase
        .from('vehicle_visits')
        .select(`
          id,
          status,
          estimated_end,
          vehicle_id ( license_plate ),
          service_id ( name ),
          payments ( amount, paid_at )
        `)
        .eq('id', visitId)
        .single();

      if (!error) setVisitData(data);
      setLoading(false);
    };

    fetchVisitData();
  }, [visitId]);

  if (loading) return <div className="p-4">Loading...</div>;

  if (!visitData) return <div className="p-4">Visit not found.</div>;

  const { vehicle_id, service_id, status, estimated_end, payments } = visitData;

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-2">CleanDrive - Car Status</h1>
      <p className="text-lg mb-2">🚗 Plate: <strong>{vehicle_id.license_plate}</strong></p>
      <p className="mb-1">🧼 Service: {service_id.name}</p>
      <p className="mb-1">📍 Status: <span className="capitalize font-semibold">{status}</span></p>
      {estimated_end && (
        <p className="mb-1">⏱ Estimated Completion: {new Date(estimated_end).toLocaleTimeString()}</p>
      )}
      {payments && (
        <div className="mt-4">
          <p>💳 Amount Due: LKR {payments.amount}</p>
          {payments.paid_at ? (
            <p className="text-green-600 font-bold">✅ Paid</p>
          ) : (
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Pay Now</button>
          )}
        </div>
      )}
    </div>
  );
}