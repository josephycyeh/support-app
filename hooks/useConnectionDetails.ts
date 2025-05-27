import { useEffect, useState } from 'react';

// Backend API endpoint for connection details
const connectionDetailsEndpoint = `${process.env.EXPO_PUBLIC_BACKEND_URL}/getConnectionDetails`;

/**
 * Retrieves LiveKit connection details from the backend API.
 * 
 * Fetches serverUrl and participantToken from the Sushi Support App backend.
 */
export function useConnectionDetails(): ConnectionDetails | undefined {
  const [details, setDetails] = useState<ConnectionDetails | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
          throw new Error('EXPO_PUBLIC_BACKEND_URL environment variable is not set');
        }
        
        const response = await fetch(connectionDetailsEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch connection details: ${response.status}`);
        }

        const json = await response.json();

        if (json.serverUrl && json.participantToken) {
          setDetails({
            url: json.serverUrl,
            token: json.participantToken,
          });
        } else {
          throw new Error('Invalid response format: missing serverUrl or participantToken');
        }
      } catch (err) {
        console.error('Error fetching connection details:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionDetails();
  }, []);

  return details;
}

type ConnectionDetails = {
  url: string;
  token: string;
};
