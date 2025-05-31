import { useCallback, useState } from 'react';

// Backend API endpoints
const connectionDetailsEndpoint = `${process.env.EXPO_PUBLIC_BACKEND_URL}/getConnectionDetails`;
const deleteRoomEndpoint = `${process.env.EXPO_PUBLIC_BACKEND_URL}/deleteRoom`;

type ConnectionDetails = {
  url: string;
  token: string;
  roomName: string;
};

/**
 * Deletes a LiveKit room from the server
 */
export async function deleteRoom(roomName: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting room: ${roomName}`);
    
    const response = await fetch(deleteRoomEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName: roomName
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Room deleted: ${result.message}`);
    return true;
  } catch (err) {
    console.error('Error deleting room:', err);
    return false;
  }
}

/**
 * Hook for getting LiveKit connection details on-demand.
 * Returns a function to fetch connection details and loading/error states.
 */
export function useConnectionDetails() {
  const [details, setDetails] = useState<ConnectionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionDetails = useCallback(async (userContext?: any): Promise<ConnectionDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
        throw new Error('EXPO_PUBLIC_BACKEND_URL environment variable is not set');
      }
      
      const response = await fetch(connectionDetailsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userContext: userContext || {}
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connection details: ${response.status}`);
      }

      const json = await response.json();
      
      if (json.serverUrl && json.participantToken && json.roomName) {
        const connectionDetails = {
          url: json.serverUrl,
          token: json.participantToken,
          roomName: json.roomName,
        };
        setDetails(connectionDetails);
        return connectionDetails;
      } else {
        console.log(json)
        throw new Error('Invalid response format: missing serverUrl, participantToken, or roomName');
      }
    } catch (err) {
      console.error('Error fetching connection details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setDetails(null);
    setError(null);
  }, []);

  return {
    details,
    loading,
    error,
    fetchConnectionDetails,
    clearDetails,
  };
}
