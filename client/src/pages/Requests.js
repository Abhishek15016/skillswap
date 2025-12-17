import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching swap requests...');
      const data = await requestService.getRequests();
      console.log('✅ Received requests data:', data);
      console.log('✅ Current user ID:', user?.id);
      setRequests(data);
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      setMessage('Failed to load requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await requestService.updateRequest(requestId, status);
      setMessage(`Request ${status} successfully!`);
      fetchRequests(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update request: ' + error.message);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await requestService.deleteRequest(requestId);
        setMessage('Request deleted successfully!');
        fetchRequests(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to delete request: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-pending',
      accepted: 'badge-accepted',
      rejected: 'badge-rejected'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sentRequests = requests.filter(req => req.from_user_id === user?.id);
  const receivedRequests = requests.filter(req => req.to_user_id === user?.id);
  
  console.log('🔍 Filtered requests:', {
    total: requests.length,
    sent: sentRequests.length,
    received: receivedRequests.length,
    currentUserId: user?.id
  });

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Swap Requests</h1>
        <p className="page-subtitle">Manage your skill swap requests</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Received Requests</h2>
        </div>
        
        {receivedRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Offers</th>
                  <th>Wants</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receivedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="flex">
                        <img 
                          src={request.from_user?.photo_url || `https://via.placeholder.com/32x32?text=${request.from_user?.name?.charAt(0)}`}
                          alt={request.from_user?.name}
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            marginRight: '10px',
                            objectFit: 'cover'
                          }}
                        />
                        <span>{request.from_user?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="skill-tag">{request.skill_offered}</span>
                    </td>
                    <td>
                      <span className="skill-tag">{request.skill_wanted}</span>
                    </td>
                    <td>
                      {request.message ? (
                        <span title={request.message}>
                          {request.message.length > 50 
                            ? request.message.substring(0, 50) + '...' 
                            : request.message
                          }
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>No message</span>
                      )}
                    </td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      {request.status === 'pending' ? (
                        <div className="flex" style={{ gap: '5px' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleStatusUpdate(request.id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : request.status === 'accepted' ? (
                        <Link 
                          to={`/chat/${request.id}`}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Chat
                        </Link>
                      ) : (
                        <span style={{ color: '#666' }}>No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📥</div>
            <h3>No received requests</h3>
            <p>You haven't received any swap requests yet.</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Sent Requests</h2>
        </div>
        
        {sentRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>To</th>
                  <th>You Offer</th>
                  <th>You Want</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="flex">
                        <img 
                          src={request.to_user?.photo_url || `https://via.placeholder.com/32x32?text=${request.to_user?.name?.charAt(0)}`}
                          alt={request.to_user?.name}
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            marginRight: '10px',
                            objectFit: 'cover'
                          }}
                        />
                        <span>{request.to_user?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="skill-tag">{request.skill_offered}</span>
                    </td>
                    <td>
                      <span className="skill-tag">{request.skill_wanted}</span>
                    </td>
                    <td>
                      {request.message ? (
                        <span title={request.message}>
                          {request.message.length > 50 
                            ? request.message.substring(0, 50) + '...' 
                            : request.message
                          }
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>No message</span>
                      )}
                    </td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      {request.status === 'pending' ? (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          Delete
                        </button>
                      ) : request.status === 'accepted' ? (
                        <Link 
                          to={`/chat/${request.id}`}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Chat
                        </Link>
                      ) : (
                        <span style={{ color: '#666' }}>No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <h3>No sent requests</h3>
            <p>You haven't sent any swap requests yet.</p>
            <Link to="/" className="btn btn-primary mt-20">
              Find People to Swap With
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests; 