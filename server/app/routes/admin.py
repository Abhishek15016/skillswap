from flask import Blueprint, request, jsonify
from app.models import db, User, SwapRequest
from app.utils.auth import require_admin, get_current_user
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_all_users():
    """Get all users (admin only)"""
    try:
        users = User.query.all()
        
        return jsonify({
            'users': [user.to_dict() for user in users],
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/ban', methods=['PUT'])
@require_admin
def ban_user(user_id):
    """Ban/unban user (admin only)"""
    try:
        data = request.get_json()
        is_banned = data.get('is_banned', True)
        
        # Update user ban status
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_banned = is_banned
        db.session.commit()
        
        action = 'banned' if is_banned else 'unbanned'
        return jsonify({
            'message': f'User {action} successfully',
            'user': user.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
@require_admin
def get_platform_stats():
    """Get platform statistics (admin only)"""
    try:
        # Get all users
        all_users = User.query.all()
        
        # Get all requests
        all_requests = SwapRequest.query.all()
        
        # Calculate statistics
        total_users = len(all_users)
        active_users = len([u for u in all_users if not u.is_banned])
        banned_users = len([u for u in all_users if u.is_banned])
        admin_users = len([u for u in all_users if u.role == 'admin'])
        
        total_requests = len(all_requests)
        pending_requests = len([r for r in all_requests if r.status == 'pending'])
        accepted_requests = len([r for r in all_requests if r.status == 'accepted'])
        rejected_requests = len([r for r in all_requests if r.status == 'rejected'])
        
        # Calculate success rate
        success_rate = 0
        if total_requests > 0:
            success_rate = (accepted_requests / total_requests) * 100
        
        # Get recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        recent_users = len([u for u in all_users if u.created_at and u.created_at >= week_ago])
        recent_requests = len([r for r in all_requests if r.created_at and r.created_at >= week_ago])
        
        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'banned': banned_users,
                'admins': admin_users,
                'recent_signups': recent_users
            },
            'requests': {
                'total': total_requests,
                'pending': pending_requests,
                'accepted': accepted_requests,
                'rejected': rejected_requests,
                'recent': recent_requests
            },
            'success_rate': round(success_rate, 1)
        }
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/requests', methods=['GET'])
@require_admin
def get_all_requests():
    """Get all swap requests (admin only)"""
    try:
        requests = SwapRequest.query.all()
        
        return jsonify({
            'requests': [req.to_dict() for req in requests],
            'total': len(requests)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/requests/<request_id>', methods=['DELETE'])
@require_admin
def delete_any_request(request_id):
    """Delete any request (admin only)"""
    try:
        request_data = SwapRequest.query.get(request_id)
        if not request_data:
            return jsonify({'error': 'Request not found'}), 404
        
        db.session.delete(request_data)
        db.session.commit()
        
        return jsonify({'message': 'Request deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 