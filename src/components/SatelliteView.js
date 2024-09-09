// src/components/SatelliteView.js
import React, { useState, useEffect } from 'react';

const SatelliteView = ({ projectId }) => {
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSatelliteData = async () => {
      try {
        // Simulate fetching satellite data related to the project
        setLoading(true);
        // You can replace this with an actual API call later
        const mockData = {
          imageUrl: 'https://example.com/satellite-image.jpg', // Mock image URL
          description: `Satellite data for project ID: ${projectId}`,
        };
        setSatelliteData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch satellite data:', err);
        setError('Error fetching satellite data.');
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSatelliteData();
    }
  }, [projectId]);

  if (loading) {
    return <div>Loading satellite data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={styles.satelliteView}>
      <h3>Satellite Data</h3>
      {satelliteData && (
        <div>
          <img
            src={satelliteData.imageUrl}
            alt={`Satellite for Project ${projectId}`}
            style={styles.image}
          />
          <p>{satelliteData.description}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  satelliteView: {
    padding: '20px',
    backgroundColor: '#F1F8E9',
    borderRadius: '10px',
    margin: '20px 0',
  },
  image: {
    width: '100%',
    borderRadius: '10px',
    marginBottom: '10px',
  },
};

export default SatelliteView;
