from flask import Blueprint, request, jsonify
from app.models import db, User, SwapRequest, ChatRoom
from app.utils.auth import require_auth, get_current_user

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/', methods=['GET'])
@require_auth
def get_requests():
    """Get user's swap requests"""
    try:
        current_user = get_current_user()
        print(f"🔍 Getting requests for user: {current_user.id}")
        
        # Get requests sent by user
        sent_requests = SwapRequest.query.filter_by(from_user_id=current_user.id).all()
        print(f"📤 Sent requests count: {len(sent_requests)}")
        
        # Get requests received by user
        received_requests = SwapRequest.query.filter_by(to_user_id=current_user.id).all()
        print(f"📥 Received requests count: {len(received_requests)}")
        
        # Combine and convert to dict
        all_requests = sent_requests + received_requests
        print(f"📊 Total requests: {len(all_requests)}")
        
        requests_data = [req.to_dict() for req in all_requests]
        print(f"✅ Returning {len(requests_data)} requests")
        
        return jsonify({
            'requests': requests_data,
            'total': len(all_requests)
        }), 200
    except Exception as e:
        print(f"❌ Error in get_requests: {e}")
        return jsonify({'error': str(e)}), 500

@requests_bp.route('/', methods=['POST'])
@require_auth
def create_request():
    """Create a new swap request"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        print(f"🔍 Creating swap request from {current_user.id} to {data.get('to_user')}")
        print(f"📝 Request data: {data}")
        
        # Validate required fields
        required_fields = ['to_user', 'skill_offered', 'skill_wanted']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if target user exists
        target_user = User.query.get(data['to_user'])
        if not target_user:
            return jsonify({'error': 'Target user not found'}), 404
        
        # Check if user is trying to request from themselves
        if current_user.id == data['to_user']:
            return jsonify({'error': 'Cannot create request to yourself'}), 400
        
        # Create request
        new_request = SwapRequest(
            from_user_id=current_user.id,
            to_user_id=data['to_user'],
            skill_offered=data['skill_offered'],
            skill_wanted=data['skill_wanted'],
            message=data.get('message', ''),
            status='pending'
        )
        
        db.session.add(new_request)
        db.session.commit()
        print(f"✅ Swap request created successfully with ID: {new_request.id}")
        
        return jsonify({
            'message': 'Swap request created successfully',
            'request': new_request.to_dict()
        }), 201
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating swap request: {e}")
        return jsonify({'error': str(e)}), 500

@requests_bp.route('/<request_id>', methods=['GET'])
@require_auth
def get_request(request_id):
    """Get specific swap request"""
    try:
        current_user = get_current_user()
        
        # Get the request
        request_data = SwapRequest.query.get(request_id)
        if not request_data:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is authorized to view this request
        if request_data.from_user_id != current_user.id and request_data.to_user_id != current_user.id:
            if current_user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({'request': request_data.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@requests_bp.route('/<request_id>', methods=['PUT'])
@require_auth
def update_request(request_id):
    """Update swap request status"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        # Get the request
        request_data = SwapRequest.query.get(request_id)
        if not request_data:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is authorized to update this request
        if request_data.to_user_id != current_user.id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Validate status
        valid_statuses = ['pending', 'accepted', 'rejected']
        new_status = data.get('status')
        if new_status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Update the request
        old_status = request_data.status
        request_data.status = new_status
        db.session.commit()
        
        # If request is accepted, create a chat room
        if new_status == 'accepted' and old_status == 'pending':
            chat_room = ChatRoom(
                user1_id=request_data.from_user_id,
                user2_id=request_data.to_user_id,
                request_id=request_id
            )
            db.session.add(chat_room)
            db.session.commit()
        
        return jsonify({
            'message': 'Request updated successfully',
            'request': request_data.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@requests_bp.route('/<request_id>', methods=['DELETE'])
@require_auth
def delete_request(request_id):
    """Delete swap request"""
    try:
        current_user = get_current_user()
        
        # Get the request
        request_data = SwapRequest.query.get(request_id)
        if not request_data:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is authorized to delete this request
        if request_data.from_user_id != current_user.id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Only allow deletion of pending requests
        if request_data.status != 'pending' and current_user.role != 'admin':
            return jsonify({'error': 'Can only delete pending requests'}), 400
        
        # Delete the request
        db.session.delete(request_data)
        db.session.commit()
        
        return jsonify({'message': 'Request deleted successfully'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 