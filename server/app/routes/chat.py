from flask import Blueprint, request, jsonify
from app.models import db, User, SwapRequest, ChatRoom, Message
from app.utils.auth import require_auth, get_current_user

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/room/<request_id>', methods=['GET'])
@require_auth
def get_chat_room(request_id):
    """Get chat room for a specific request"""
    try:
        current_user = get_current_user()
        print(f"🔍 Getting chat room for request ID: {request_id}, user: {current_user.id}")
        
        # Get the request to verify access
        request_data = SwapRequest.query.get(request_id)
        if not request_data:
            print(f"❌ Request not found: {request_id}")
            return jsonify({'error': 'Request not found'}), 404
        
        print(f"✅ Request found: {request_data.id}, status: {request_data.status}")
        
        # Check if user is authorized to access this chat
        if request_data.from_user_id != current_user.id and request_data.to_user_id != current_user.id:
            if current_user.role != 'admin':
                print(f"❌ Unauthorized access attempt")
                return jsonify({'error': 'Unauthorized'}), 403
        
        # Get or create chat room
        chat_room = ChatRoom.query.filter_by(request_id=request_id).first()
        if not chat_room:
            # Create chat room if request is accepted
            if request_data.status == 'accepted':
                chat_room = ChatRoom(
                    user1_id=request_data.from_user_id,
                    user2_id=request_data.to_user_id,
                    request_id=request_id
                )
                db.session.add(chat_room)
                db.session.commit()
                print(f"✅ Created new chat room: {chat_room.id}")
            else:
                print(f"❌ Chat room not available - request status: {request_data.status}")
                return jsonify({'error': 'Chat room not available for this request'}), 404
        else:
            print(f"✅ Found existing chat room: {chat_room.id}")
        
        # Get messages for this chat room
        messages = Message.query.filter_by(chat_room_id=chat_room.id).order_by(Message.created_at).all()
        print(f"📝 Found {len(messages)} messages")
        
        response_data = {
            'chat_room': chat_room.to_dict(),
            'swap_request': request_data.to_dict(),
            'messages': [msg.to_dict() for msg in messages]
        }
        print(f"✅ Returning chat data with {len(response_data['messages'])} messages")
        
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in get_chat_room: {e}")
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/<room_id>', methods=['GET'])
@require_auth
def get_messages(room_id):
    """Get messages for a chat room"""
    try:
        current_user = get_current_user()
        
        # Get chat room to verify access
        chat_room = ChatRoom.query.get(room_id)
        if not chat_room:
            return jsonify({'error': 'Chat room not found'}), 404
        
        # Check if user is authorized to access this chat room
        if chat_room.user1_id != current_user.id and chat_room.user2_id != current_user.id:
            if current_user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        # Get messages
        messages = Message.query.filter_by(chat_room_id=room_id).order_by(Message.created_at).all()
        
        return jsonify({
            'messages': [msg.to_dict() for msg in messages],
            'total': len(messages)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/<room_id>', methods=['POST'])
@require_auth
def send_message(room_id):
    """Send a message in a chat room"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data.get('text'):
            return jsonify({'error': 'Message text is required'}), 400
        
        # Get chat room to verify access
        chat_room = ChatRoom.query.get(room_id)
        if not chat_room:
            return jsonify({'error': 'Chat room not found'}), 404
        
        # Check if user is authorized to send messages in this chat room
        if chat_room.user1_id != current_user.id and chat_room.user2_id != current_user.id:
            if current_user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        # Create message
        message = Message(
            chat_room_id=room_id,
            sender_id=current_user.id,
            text=data['text']
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'message': 'Message sent successfully',
            'chat_message': message.to_dict()
        }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def get_user_chat_rooms(user_id):
    """Get chat rooms for a specific user"""
    try:
        current_user = get_current_user()
        
        # Check if user is requesting their own chat rooms or is admin
        if current_user.id != user_id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get chat rooms where user is a participant
        chat_rooms = ChatRoom.query.filter(
            (ChatRoom.user1_id == user_id) | (ChatRoom.user2_id == user_id)
        ).all()
        
        # Get detailed chat room data with request info
        chat_rooms_data = []
        for chat_room in chat_rooms:
            # Get the associated request
            request_data = SwapRequest.query.get(chat_room.request_id)
            if request_data:
                chat_rooms_data.append({
                    'id': chat_room.id,
                    'request_id': chat_room.request_id,
                    'created_at': chat_room.created_at.isoformat() if chat_room.created_at else None,
                    'swap_request': request_data.to_dict()
                })
        
        return jsonify({
            'chat_rooms': chat_rooms_data,
            'total': len(chat_rooms_data)
        }), 200
    except Exception as e:
        print(f"❌ Error in get_user_chat_rooms: {e}")
        return jsonify({'error': str(e)}), 500 